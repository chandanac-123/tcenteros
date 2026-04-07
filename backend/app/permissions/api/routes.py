from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.dependencies import centeradmin_required
from app.core.database import get_async_session

from app.permissions.models.models import (
    Module, SubModule, Action,
    Permission, DesignationPermission
)
from app.settings.models.models import Designation
from app.permissions.schema.schema import AssignPermissionRequest

router = APIRouter()


# =========================
# HELPER: GET OR CREATE PERMISSION
# =========================
async def get_or_create_permission(db, module_id, submodule_id=None, action_id=None):

    result = await db.execute(
        select(Permission).where(
            Permission.module_id == module_id,
            Permission.submodule_id == submodule_id,
            Permission.action_id == action_id
        )
    )
    permission = result.scalar_one_or_none()

    if not permission:
        permission = Permission(
            id=uuid.uuid4(),
            module_id=module_id,
            submodule_id=submodule_id,
            action_id=action_id,
            code=f"{module_id}-{submodule_id}-{action_id}"
        )
        db.add(permission)
        await db.flush()

    return permission


# =========================
# MAIN API
# =========================
@router.post("/designation/permissions")
async def assign_permissions(
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(centeradmin_required)
):
    try:
        # ✅ 1. Get designation
        result = await db.execute(
            select(Designation).where(Designation.id == payload.designation_id)
        )
        designation = result.scalar_one_or_none()

        if not designation:
            raise HTTPException(404, "Designation not found")

        # ✅ 2. Center validation
        if str(designation.center_id) != current_user["center_id"]:
            raise HTTPException(403, "Unauthorized for this center")

        # ✅ 3. Remove old permissions (update case)
        await db.execute(
            delete(DesignationPermission).where(
                DesignationPermission.designation_id == designation.id
            )
        )

        # =========================
        # PROCESS JSON
        # =========================
        for module_name, module_data in payload.permissions.items():

            module = (await db.execute(
                select(Module).where(Module.name == module_name)
            )).scalar_one_or_none()

            if not module or not module_data.get("enabled"):
                continue

            # 🔹 Module-level permission
            perm = await get_or_create_permission(db, module.id)
            db.add(DesignationPermission(
                designation_id=designation.id,
                permission_id=perm.id
            ))

            submodules = module_data.get("submodules", {})

            for sub_name, sub_data in submodules.items():

                submodule = (await db.execute(
                    select(SubModule).where(
                        SubModule.module_id == module.id,
                        SubModule.name == sub_name
                    )
                )).scalar_one_or_none()

                if not submodule:
                    continue

                # 🔹 Boolean case
                if isinstance(sub_data, bool):
                    if sub_data:
                        perm = await get_or_create_permission(
                            db, module.id, submodule.id
                        )
                        db.add(DesignationPermission(
                            designation_id=designation.id,
                            permission_id=perm.id
                        ))

                # 🔹 Action case
                elif isinstance(sub_data, dict):
                    for action_name, allowed in sub_data.items():

                        if not allowed:
                            continue

                        action = (await db.execute(
                            select(Action).where(Action.name == action_name)
                        )).scalar_one_or_none()

                        if not action:
                            continue

                        perm = await get_or_create_permission(
                            db,
                            module.id,
                            submodule.id,
                            action.id
                        )

                        db.add(DesignationPermission(
                            designation_id=designation.id,
                            permission_id=perm.id
                        ))

        await db.commit()

        return {
            "status": "success",
            "message": "Permissions assigned successfully",
            "designation_id": str(designation.id)
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(500, str(e))
    



@router.get("/designation/permissions")
async def list_designation_permissions(
    db: AsyncSession = Depends(get_async_session),
    current_user: dict = Depends(centeradmin_required)
):
    try:
        center_id = current_user["center_id"]

        # ✅ 1. Get all designations of this center
        result = await db.execute(
            select(Designation).where(Designation.center_id == center_id)
        )
        designations = result.scalars().all()

        if not designations:
            return {"status": "success", "data": []}

        final_response = []

        # =========================
        # LOOP EACH DESIGNATION
        # =========================
        for designation in designations:

            result = await db.execute(
                select(Permission, Module, SubModule, Action)
                .join(DesignationPermission, DesignationPermission.permission_id == Permission.id)
                .join(Module, Module.id == Permission.module_id)
                .outerjoin(SubModule, SubModule.id == Permission.submodule_id)
                .outerjoin(Action, Action.id == Permission.action_id)
                .where(DesignationPermission.designation_id == designation.id)
            )

            rows = result.all()

            permissions_dict = {}

            for perm, module, submodule, action in rows:

                module_name = module.name

                if module_name not in permissions_dict:
                    permissions_dict[module_name] = {
                        "enabled": True,
                        "submodules": {}
                    }

                if not submodule:
                    continue

                sub_name = submodule.name

                if sub_name not in permissions_dict[module_name]["submodules"]:
                    permissions_dict[module_name]["submodules"][sub_name] = {}

                # boolean submodule
                if not action:
                    permissions_dict[module_name]["submodules"][sub_name] = True

                else:
                    if isinstance(permissions_dict[module_name]["submodules"][sub_name], bool):
                        permissions_dict[module_name]["submodules"][sub_name] = {}

                    permissions_dict[module_name]["submodules"][sub_name][action.name] = True

            final_response.append({
                "designation_id": str(designation.id),
                "designation_name": designation.name,
                "permissions": permissions_dict
            })

        return {
            "status": "success",
            "data": final_response
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))