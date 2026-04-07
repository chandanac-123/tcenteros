import asyncio
import uuid
from sqlalchemy import select

# 🔥 IMPORTANT: LOAD ALL MODELS FIRST

from app.core.database import AsyncSessionLocal
from app.permissions.models.models import Module, SubModule, Action
from app.permissions.utils.permission_master_data import PERMISSION_DATA


# =========================
# HELPERS
# =========================

async def get_or_create_module(db, name):
    result = await db.execute(select(Module).where(Module.name == name))
    module = result.scalar_one_or_none()

    if not module:
        module = Module(id=uuid.uuid4(), name=name)
        db.add(module)
        await db.flush()

    return module


async def get_or_create_submodule(db, module_id, name):
    result = await db.execute(
        select(SubModule).where(
            SubModule.module_id == module_id,
            SubModule.name == name
        )
    )
    submodule = result.scalar_one_or_none()

    if not submodule:
        submodule = SubModule(
            id=uuid.uuid4(),
            name=name,
            module_id=module_id
        )
        db.add(submodule)
        await db.flush()

    return submodule


async def get_or_create_action(db, name):
    result = await db.execute(select(Action).where(Action.name == name))
    action = result.scalar_one_or_none()

    if not action:
        action = Action(id=uuid.uuid4(), name=name)
        db.add(action)
        await db.flush()

    return action


# =========================
# MAIN
# =========================

async def seed_master_data():
    async with AsyncSessionLocal() as db:  # ✅ FIXED
        try:
            for module_name, submodules in PERMISSION_DATA.items():

                module = await get_or_create_module(db, module_name)

                if isinstance(submodules, list):
                    for sub_name in submodules:
                        await get_or_create_submodule(db, module.id, sub_name)

                elif isinstance(submodules, dict):
                    for sub_name, actions in submodules.items():

                        submodule = await get_or_create_submodule(
                            db, module.id, sub_name
                        )

                        for action_name in actions:
                            await get_or_create_action(db, action_name)

            await db.commit()
            print("✅ Modules, SubModules, Actions inserted successfully!")

        except Exception as e:
            await db.rollback()
            print("❌ Error:", str(e))


# =========================
# RUN
# =========================

if __name__ == "__main__":
    asyncio.run(seed_master_data())