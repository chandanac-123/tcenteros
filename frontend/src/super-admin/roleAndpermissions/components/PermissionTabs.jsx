import React, { useEffect, useState } from "react";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { useFormik } from "formik";
import DeleteModal from "@common/components/CustomeDelete";
import AddCategory from "@pages/employee-management/category/AddCategory";
import { permissionData } from "./PermissionData";
import {
  useCreatePermissionMutation,
  usePermissionQuery,
  useDeleteDesignationMutation,
} from "@api-queries/super-admin/role-permission/Query";
import { Trash2 } from "lucide-react";

const PermissionTabs = () => {
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);

  const { data } = usePermissionQuery();
  const { mutateAsync: create_permission } = useCreatePermissionMutation();
  const { mutateAsync: delete_designation } = useDeleteDesignationMutation();

  // Convert API permissions to UI format
  const transformPermissions = (apiPermissions) => {
    const result = {};

    Object.entries(apiPermissions || {}).forEach(([moduleId, module]) => {
      result[moduleId] = {
        enabled: module?.enabled ?? false,
      };
    });

    return result;
  };

  // Initialize permissions
  useEffect(() => {
    if (data?.data?.length) {
      const firstRole = data.data[0];

      setSelectedRole((prev) => {
        const exists = data.data.some((role) => role.designation_id === prev);
        return exists ? prev : firstRole.designation_id;
      });

      const formattedPermissions = {};

      data.data.forEach((role) => {
        formattedPermissions[role.designation_id] = transformPermissions(
          role.permissions,
        );
      });

      setPermissions(formattedPermissions);
    }
  }, [data]);

  // Toggle module permission
  const toggleModule = (moduleId) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: {
          enabled: !prev[selectedRole]?.[moduleId]?.enabled,
        },
      },
    }));
  };

  // Submit permissions
  const formik = useFormik({
    initialValues: {},
    onSubmit: async () => {
      try {
        const roleData = permissions[selectedRole] || {};
        const cleanedPermissions = {};

        permissionData.forEach((module) => {
          if (roleData[module.id]?.enabled) {
            cleanedPermissions[module.id] = {
              enabled: true,
            };
          }
        });

        const finalPayload = {
          designation_id: selectedRole,
          permissions: cleanedPermissions,
        };

        console.log("FINAL PAYLOAD:", finalPayload);

        await create_permission(finalPayload);
      } catch (error) {
        console.error("Error saving permissions:", error);
      }
    },
  });

  // Delete designation
  const handleDelete = async (id) => {
    try {
      await delete_designation(id);

      setPermissions((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      setSelectedRole(null);
      setDeleteOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const rolePermissions = permissions[selectedRole] || {};

  const selectedRoleData = data?.data?.find(
    (role) => role.designation_id === selectedRole,
  );

  return (
    <ContentLayout>
      <div className="h-full flex flex-col">
        <form
          id="role-permissions-form"
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Left Side - Roles */}
            <div className="w-full md:w-60 flex flex-col gap-2 p-3 border rounded-lg overflow-y-auto">
              {data?.data?.map((role) => (
                <div
                  key={role.designation_id}
                  className="mb-2 flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedRole(role.designation_id)}
                    className={`block flex-1 text-left p-2 ${
                      selectedRole === role.designation_id
                        ? "bg-primary/20 text-primary rounded-md"
                        : "rounded-md hover:bg-gray-100"
                    }`}
                  >
                    {role.designation_name}
                  </button>

                  {selectedRole === role.designation_id && (
                    <Button
                      size="mini"
                      variant="danger"
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Right Side - Permissions */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {permissionData.map((module) => {
                const moduleState = rolePermissions[module.id] || {};
                const isDashboard = module.id === "dashboard";

                return (
                  <div key={module.id} className="border rounded">
                    <div className="flex items-center gap-2 p-3">
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={
                          isDashboard ? true : moduleState.enabled || false
                        }
                        disabled={isDashboard} // Dashboard cannot be unchecked
                        onChange={() => {
                          if (!isDashboard) {
                            toggleModule(module.id);
                          }
                        }}
                      />
                      <span className="font-semibold">{module.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <Button form="role-permissions-form" size="addbutton" type="submit">
            Submit
          </Button>
        </div>

        {/* Modals */}
        <AddCategory categoryOpen={open} setCategoryOpen={setOpen} />

        <DeleteModal
          open={deleteOpen}
          setOpen={setDeleteOpen}
          header="Delete Designation"
          description={`Are you sure you want to delete ${
            selectedRoleData?.designation_name || "this designation"
          }?`}
          onConfirm={() => handleDelete(selectedRole)}
        />
      </div>
    </ContentLayout>
  );
};

export default PermissionTabs;
