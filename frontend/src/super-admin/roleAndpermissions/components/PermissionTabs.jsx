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
  const [openModules, setOpenModules] = useState({});
  const { data, isFetching } = usePermissionQuery();
  const { mutateAsync: create_permission } = useCreatePermissionMutation();
  const { mutateAsync: delete_designation } = useDeleteDesignationMutation();

  // Deletes a role/designation
  const handleDelete = async (id) => {
    try {
      await delete_designation(id); // API call to delete role
      setPermissions((prev) => {
        // Remove deleted role from local state
        const updatedPermissions = { ...prev };
        delete updatedPermissions[id];
        return updatedPermissions;
      });
      // Reset UI
      setSelectedRole(null);
      setDeleteOpen(false);
    } catch (err) {
      return err;
    }
  };

  const toggleCollapse = (moduleId) => {
    // Toggle expand/collapse of a module UI
    setOpenModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const formik = useFormik({
    initialValues: { role: "" },
    onSubmit: async () => {
      try {
        const roleData = permissions[selectedRole] || {};
        const cleanedPermissions = {};
        permissionData.forEach((module) => {
          const moduleState = roleData[module.id];
          //  ALWAYS include dashboard
          if (module.id !== "dashboard" && !moduleState?.enabled) return;
          //  CASE 1: NO SUBMODULES
          if (!module.submodules || module.submodules.length === 0) {
            cleanedPermissions[module.id] = {
              enabled: true,
            };
            return;
          }
          //  CASE 2: HAS SUBMODULES
          const modulePayload = {
            enabled: true,
            submodules: {},
          };

          module.submodules.forEach((sub) => {
            //  FORCE dashboard overview always
            if (module.id === "dashboard" && sub.id === "overview") {
              modulePayload.submodules["overview"] = true;
              return;
            }
            const subState = moduleState?.submodules?.[sub.id];
            if (!subState?.enabled) return;

            //  HAS ACTIONS
            if (module.sub_submodules?.[sub.id]) {
              const actions = {};

              module.sub_submodules[sub.id].forEach((a) => {
                if (subState.actions?.[a.id]) {
                  actions[a.id] = true;
                }
              });

              if (Object.keys(actions).length > 0) {
                modulePayload.submodules[sub.id] = actions;
              }
            }
            //  NO ACTIONS
            else {
              modulePayload.submodules[sub.id] = true;
            }
          });

          //  Ensure dashboard always has overview
          if (module.id === "dashboard") {
            modulePayload.submodules["overview"] = true;
          }

          //  Add only if has submodules OR dashboard
          if (
            Object.keys(modulePayload.submodules).length > 0 ||
            module.id === "dashboard"
          ) {
            cleanedPermissions[module.id] = modulePayload;
          }
        });

        //  Prevent empty submission (except dashboard)
        if (!Object.keys(cleanedPermissions).length) {
          console.warn("No permissions selected");
          return;
        }

        const finalPayload = {
          designation_id: selectedRole,
          permissions: cleanedPermissions,
        };

        console.log("FINAL API PAYLOAD 👉", finalPayload);

        //  API CALL
        await create_permission(finalPayload);

        console.log("Permissions saved successfully");
      } catch (error) {
        console.error("Error saving permissions ❌", error);
      }
    },
  });

  // Converts API response → UI-friendly structure
  const transformPermissions = (apiPermissions) => {
    const result = {};

    Object.entries(apiPermissions || {}).forEach(([moduleId, module]) => {
      const submodules = {};

      Object.entries(module.submodules || {}).forEach(([subId, value]) => {
        //  if submodule has actions
        if (typeof value === "object") {
          submodules[subId] = {
            enabled: true,
            actions: value,
          };
        }
        //  simple true/false
        else {
          submodules[subId] = {
            enabled: value,
          };
        }
      });

      result[moduleId] = {
        enabled: module.enabled,
        submodules,
      };
    });

    return result;
  };

  // Enable/Disable entire module
  const toggleModule = (moduleId) => {
    setPermissions((prev) => {
      const currentEnabled = prev[selectedRole]?.[moduleId]?.enabled;
      const module = permissionData.find((m) => m.id === moduleId);

      let submodules = {};
      // If enabling → auto-enable all submodules
      if (!currentEnabled) {
        module?.submodules?.forEach((sub) => {
          if (module.id === "dashboard" && sub.id === "overview") {
            submodules[sub.id] = { enabled: true };
            return;
          }
          // If submodule has actions → enable all
          if (module.sub_submodules?.[sub.id]) {
            const actions = {};
            module.sub_submodules[sub.id].forEach((action) => {
              actions[action.id] = true;
            });
            submodules[sub.id] = { enabled: true, actions };
          } else {
            submodules[sub.id] = { enabled: true };
          }
        });
      }

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: !currentEnabled,
            submodules: !currentEnabled ? submodules : {},
          },
        },
      };
    });
  };

  // Enable/Disable a submodule
  const toggleSubmodule = (moduleId, subId) => {
    setPermissions((prev) => {
      const moduleState = prev[selectedRole]?.[moduleId] || {};
      const submodules = moduleState.submodules || {};

      const current = submodules?.[subId]?.enabled;
      // Toggle submodule
      const updatedSubmodules = {
        ...submodules,
        [subId]: {
          enabled: !current,
          actions: submodules?.[subId]?.actions || {},
        },
      };
      // Check if ANY submodule is enabled
      const anyEnabled = Object.values(updatedSubmodules).some(
        (sub) => sub.enabled,
      );
      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: anyEnabled,
            submodules: updatedSubmodules,
          },
        },
      };
    });
  };

  // Toggle individual action inside a submodule
  const toggleSubSubmodule = (moduleId, subId, actionId) => {
    setPermissions((prev) => {
      const moduleState = prev[selectedRole]?.[moduleId] || {};
      const submodules = moduleState.submodules || {};
      const subState = submodules?.[subId] || {};
      // Toggle action
      const updatedActions = {
        ...subState.actions,
        [actionId]: !subState.actions?.[actionId],
      };
      // Check if any action is enabled
      const anyActionEnabled = Object.values(updatedActions).some((v) => v);
      // Update submodule
      const updatedSubmodules = {
        ...submodules,
        [subId]: {
          enabled: anyActionEnabled,
          actions: updatedActions,
        },
      };
      // Check if any submodule is enabled
      const anySubEnabled = Object.values(updatedSubmodules).some(
        (sub) => sub.enabled,
      );

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: anySubEnabled,
            submodules: updatedSubmodules,
          },
        },
      };
    });
  };

  const rolePermissions = permissions[selectedRole] || {};
  const selectedRoleData = data?.data?.find(
    (role) => role.designation_id === selectedRole,
  );
  // Initialize permissions from API
  useEffect(() => {
    if (data?.data?.length) {
      const firstRole = data.data[0];
      setSelectedRole((prev) => {
        const roleExists = data.data.some(
          (role) => role.designation_id === prev,
        );
        return roleExists ? prev : firstRole.designation_id;
      });
      // Transform API permissions → UI state
      const formattedPermissions = {};
      data.data.forEach((role) => {
        formattedPermissions[role.designation_id] = transformPermissions(
          role.permissions,
        );
      });
      setPermissions(formattedPermissions);
    }
  }, [data]);
  // Determines partial checkbox state (some selected but not all)
  const isIndeterminate = (module) => {
    const moduleState = rolePermissions[module.id];
    if (!moduleState?.submodules) return false;

    const subs = Object.values(moduleState.submodules);
    const someChecked = subs.some((s) => s.enabled);
    const allChecked = subs.every((s) => s.enabled);

    return someChecked && !allChecked;
  };

  return (
    <ContentLayout>
      <div className="h-full flex flex-col">
        <form
          onSubmit={formik.handleSubmit}
          id="role-permissions-form"
          className="flex-1 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row flex-1 gap-4 w-full h-full overflow-hidden">
            {/* LEFT */}
            <div className="w-full md:w-60 flex flex-col gap-2 p-3 border rounded-lg overflow-y-auto">
              {data?.data?.map((role) => (
                <div
                  key={role?.designation_id}
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
                    {role?.designation_name}
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

            {/* RIGHT */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {permissionData.map((module) => {
                const moduleState = rolePermissions[module.id] || {};
                const isOpen = openModules[module.id];

                return (
                  <div key={module.id} className="border rounded">
                    {!module.submodules?.length ? (
                      //  NO SUBMODULE → SIMPLE ROW
                      <div className="flex items-center gap-2 p-3">
                        <input
                          type="checkbox"
                          className="accent-primary"
                          checked={moduleState.enabled || false}
                          onChange={() => toggleModule(module.id)}
                        />
                        <span className="font-semibold">{module.name}</span>
                      </div>
                    ) : (
                      //  HAS SUBMODULE → COLLAPSE UI
                      <>
                        {/* HEADER */}
                        <div
                          className="flex items-center justify-between p-3 cursor-pointer bg-gray-100"
                          onClick={() => toggleCollapse(module.id)}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="accent-primary"
                              checked={moduleState.enabled || false}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = isIndeterminate(module);
                                }
                              }}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleModule(module.id);
                              }}
                            />
                            <span className="font-semibold">{module.name}</span>
                          </div>

                          <span>{isOpen ? "−" : "+"}</span>
                        </div>

                        {/* BODY */}
                        {isOpen && (
                          <div className="p-3">
                            {module.submodules.map((sub) => {
                              const subState =
                                moduleState.submodules?.[sub.id] || {};

                              return (
                                <div key={sub.id} className="ml-4 mb-2">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      className="accent-primary"
                                      checked={
                                        module.id === "dashboard" &&
                                        sub.id === "overview"
                                          ? true
                                          : subState.enabled || false
                                      }
                                      disabled={
                                        module.id === "dashboard" &&
                                        sub.id === "overview"
                                      }
                                      onChange={() =>
                                        toggleSubmodule(module.id, sub.id)
                                      }
                                    />
                                    {sub.label}
                                  </label>

                                  {subState.enabled &&
                                    module.sub_submodules?.[sub.id] && (
                                      <div className="ml-6 mt-1 flex flex-wrap gap-4">
                                        {module.sub_submodules[sub.id].map(
                                          (a) => (
                                            <label
                                              key={a.id}
                                              className="flex gap-1"
                                            >
                                              <input
                                                type="checkbox"
                                                className="accent-primary"
                                                checked={
                                                  subState.actions?.[a.id] ||
                                                  false
                                                }
                                                onChange={() =>
                                                  toggleSubSubmodule(
                                                    module.id,
                                                    sub.id,
                                                    a.id,
                                                  )
                                                }
                                              />
                                              {a.label}
                                            </label>
                                          ),
                                        )}
                                      </div>
                                    )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        <div className="flex justify-end mt-4 ">
          {" "}
          <Button
            form="role-permissions-form"
            size="addbutton"
            variant="default"
            type="submit"
          >
            {" "}
            Submit{" "}
          </Button>{" "}
        </div>

        <AddCategory categoryOpen={open} setCategoryOpen={setOpen} />
        <DeleteModal
          open={deleteOpen}
          setOpen={setDeleteOpen}
          header="Delete Designation"
          description={`Are you sure you want to delete ${selectedRoleData?.designation_name || "this designation"}?`}
          onConfirm={() => handleDelete(selectedRole)}
        />
      </div>
    </ContentLayout>
  );
};

export default PermissionTabs;
