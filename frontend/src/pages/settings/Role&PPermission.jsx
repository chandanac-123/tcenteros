import React, { useState } from 'react'
const modulesData = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    submodules: []
  },
  {
    id: 'employee_management',
    name: 'Employee Management',
    submodules: ['Employee', 'Salary Structure', 'Payroll'],
    sub_submodules: {
      Employee: ['Add', 'Edit', 'Delete'],
      Attendance: ['View', 'Edit'],
      Payroll: ['Generate', 'View']
    }
  },
  {
    id: 'accounts',
    name: 'Accounts',
    submodules: ['Users', 'Roles']
  },
  {
    id: 'billing',
    name: 'Billing',
    submodules: ['Invoices', 'Payments']
  },
  {
    id: 'crm',
    name: 'CRM',
    submodules: ['Member', 'Visitor', 'Guest'],
    sub_submodules: {
      Member: ['List', 'Add', 'Edit', 'Delete'],
      Visitor: ['Add', 'Edit', 'Delete'],
      Guest: ['Add', 'Edit', 'Delete']
    }
  }
]

const RoleAndPermission = () => {
  const [permissions, setPermissions] = useState({})

  const toggleModule = moduleId => {
    setPermissions(prev => {
      const isEnabled = !prev[moduleId]?.enabled

      return {
        ...prev,
        [moduleId]: {
          enabled: isEnabled,
          submodules: prev[moduleId]?.submodules || {}
        }
      }
    })
  }

  const toggleSubmodule = (moduleId, sub) => {
    setPermissions(prev => {
      const current = prev[moduleId]?.submodules?.[sub]?.enabled

      return {
        ...prev,
        [moduleId]: {
          enabled: true,
          submodules: {
            ...prev[moduleId]?.submodules,
            [sub]: {
              enabled: !current,
              actions: prev[moduleId]?.submodules?.[sub]?.actions || {}
            }
          }
        }
      }
    })
  }

  const toggleSubSubmodule = (moduleId, sub, action) => {
    setPermissions(prev => ({
      ...prev,
      [moduleId]: {
        enabled: true,
        submodules: {
          ...prev[moduleId]?.submodules,
          [sub]: {
            enabled: true,
            actions: {
              ...prev[moduleId]?.submodules?.[sub]?.actions,
              [action]: !prev[moduleId]?.submodules?.[sub]?.actions?.[action]
            }
          }
        }
      }
    }))
  }
  console.log('permissions:', permissions)

  return (
    <div className='space-y-4'>
      {modulesData.map(module => {
        const moduleState = permissions[module.id] || {}

        return (
          <div key={module.id} className='border p-3 rounded-lg'>
            {/* MODULE */}
            <label className='flex items-center gap-2 font-medium'>
              <input
                type='checkbox'
                checked={moduleState.enabled || false}
                onChange={() => toggleModule(module.id)}
              />
              {module.name}
            </label>

            {/* SUBMODULES */}
            {moduleState.enabled && module.submodules.length > 0 && (
              <div className='ml-6 mt-2 space-y-2'>
                {module.submodules.map(sub => {
                  const subState = moduleState.submodules?.[sub] || {}

                  return (
                    <div key={sub}>
                      {/* SUBMODULE */}
                      <label className='flex items-center gap-2 text-sm'>
                        <input
                          type='checkbox'
                          checked={subState.enabled || false}
                          onChange={() => toggleSubmodule(module.id, sub)}
                        />
                        {sub}
                      </label>

                      {/* SUB-SUBMODULES */}
                      {subState.enabled &&
                        module.sub_submodules?.[sub]?.length > 0 && (
                          <div className='ml-6 mt-1 flex flex-wrap gap-3'>
                            {module.sub_submodules[sub].map(action => (
                              <label
                                key={action}
                                className='flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded'
                              >
                                <input
                                  type='checkbox'
                                  checked={subState.actions?.[action] || false}
                                  onChange={() =>
                                    toggleSubSubmodule(module.id, sub, action)
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
  )
}

export default RoleAndPermission
