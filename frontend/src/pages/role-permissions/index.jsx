import React, { useState } from 'react'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { modulesData } from './components/ModuleData'

const roles = ['Admin', 'Branch Manager', 'Trainer', 'Staff']



const RoleAndPermission = () => {
  const [permissions, setPermissions] = useState({})
  const [selectedRole, setSelectedRole] = useState('Admin')

  const toggleModule = (moduleId) => {
    setPermissions((prev) => {
      const current = prev[selectedRole]?.[moduleId]?.enabled

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: !current,
            submodules: prev[selectedRole]?.[moduleId]?.submodules || {}
          }
        }
      }
    })
  }

  const toggleSubmodule = (moduleId, sub) => {
    setPermissions((prev) => {
      const current =
        prev[selectedRole]?.[moduleId]?.submodules?.[sub]?.enabled

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: true,
            submodules: {
              ...prev[selectedRole]?.[moduleId]?.submodules,
              [sub]: {
                enabled: !current,
                actions:
                  prev[selectedRole]?.[moduleId]?.submodules?.[sub]?.actions ||
                  {}
              }
            }
          }
        }
      }
    })
  }

  const toggleSubSubmodule = (moduleId, sub, action) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleId]: {
          enabled: true,
          submodules: {
            ...prev[selectedRole]?.[moduleId]?.submodules,
            [sub]: {
              enabled: true,
              actions: {
                ...prev[selectedRole]?.[moduleId]?.submodules?.[sub]?.actions,
                [action]:
                  !prev[selectedRole]?.[moduleId]?.submodules?.[sub]?.actions?.[
                    action
                  ]
              }
            }
          }
        }
      }
    }))
  }

  const rolePermissions = permissions[selectedRole] || {}

  return (
    <ContentLayout>
      <div className="flex gap-4 w-full">

        {/* LEFT SIDE - ROLES */}
        <div className="w-60 flex flex-col gap-2 p-3 border rounded-lg">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`p-2 rounded-md text-left border ${
                selectedRole === role
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* RIGHT SIDE - PERMISSIONS */}
        <div className="flex-1 border p-4 rounded-lg space-y-4">
          {modulesData.map((module) => {
            const moduleState = rolePermissions[module.id] || {}

            return (
              <div key={module.id} className="border rounded-lg p-3">

                {/* MODULE */}
                <label className="flex items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={moduleState.enabled || false}
                    onChange={() => toggleModule(module.id)}
                  />
                  {module.name}
                </label>

                {/* SUBMODULES */}
                {moduleState.enabled && module.submodules.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2">
                    {module.submodules.map((sub) => {
                      const subState =
                        moduleState.submodules?.[sub] || {}

                      return (
                        <div key={sub}>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={subState.enabled || false}
                              onChange={() =>
                                toggleSubmodule(module.id, sub)
                              }
                            />
                            {sub}
                          </label>

                          {/* ACTIONS */}
                          {subState.enabled &&
                            module.sub_submodules?.[sub] && (
                              <div className="ml-6 mt-1 flex flex-wrap gap-2">
                                {module.sub_submodules[sub].map((action) => (
                                  <label
                                    key={action}
                                    className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        subState.actions?.[action] || false
                                      }
                                      onChange={() =>
                                        toggleSubSubmodule(
                                          module.id,
                                          sub,
                                          action
                                        )
                                      }
                                    />
                                    {action}
                                  </label>
                                ))}
                              </div>
                            )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </ContentLayout>
  )
}

export default RoleAndPermission