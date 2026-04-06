import React, { useState } from 'react'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { modulesData } from './components/ModuleData'
import { Button } from '@pages/components/ui/button'
import AddRole from './components/AddRole'
import { useFormik } from 'formik'
import deleteicon from '@assets/form-icons/delete.svg'
import DeleteModal from '@common/components/CustomeDelete'

const roles = ['Admin', 'Branch Manager', 'Trainer', 'Staff']

const RoleAndPermission = () => {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissions, setPermissions] = useState({})
  const [selectedRole, setSelectedRole] = useState('Admin')

 const formik = useFormik({
  initialValues: {
    role: ''
  },
  onSubmit: async () => {
    try {
      const roleData = permissions[selectedRole] || {}

      const payload = {}

      modulesData.forEach(module => {
        const moduleState = roleData[module.id]

        if (!moduleState?.enabled) return

        const modulePayload = {
          enabled: true,
          submodules: {}
        }

        module.submodules?.forEach(sub => {
          const subKey = sub.id
          const subState = moduleState?.submodules?.[subKey]

          if (!subState?.enabled) return

          // If has actions
          if (module.sub_submodules?.[subKey]) {
            const actionsPayload = {}

            module.sub_submodules[subKey].forEach(action => {
              const actionKey = action.id

              if (subState?.actions?.[actionKey]) {
                actionsPayload[actionKey] = true
              }
            })

            // only add if actions selected
            if (Object.keys(actionsPayload).length > 0) {
              modulePayload.submodules[subKey] = actionsPayload
            }
          } else {
            // no actions → simple true
            modulePayload.submodules[subKey] = true
          }
        })

        payload[module.id] = modulePayload
      })

      console.log('FINAL CLEAN PAYLOAD 👉', payload)

    } catch (error) {
      console.error(error)
    }
  }
})

  const toggleModule = moduleId => {
    setPermissions(prev => {
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
    setPermissions(prev => {
      const current = prev[selectedRole]?.[moduleId]?.submodules?.[sub]?.enabled

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
    setPermissions(prev => ({
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

  const handleDeleteRole = roleToDelete => {
    // prevent deleting selected role (optional)
    if (roleToDelete === selectedRole) {
      setSelectedRole('')
    }

    // remove from roles list
    const updatedRoles = roles.filter(r => r !== roleToDelete)

    // if roles is state → use setRoles(updatedRoles)
    console.log(updatedRoles)

    // also remove permissions
    setPermissions(prev => {
      const updated = { ...prev }
      delete updated[roleToDelete]
      return updated
    })
  }

  const rolePermissions = permissions[selectedRole] || {}

  return (
    <ContentLayout>
      <div className='h-full flex flex-col'>
        <div className='flex justify-between mb-4'>
          <span className='text-xl font-semibold text-textblack'>
            Role and Permissions
          </span>
          <Button size='addbutton' onClick={() => setOpen(true)}>
            + Add Role
          </Button>
        </div>
        <form
          onSubmit={formik.handleSubmit}
          id='role-permissions-form'
          className='flex-1 overflow-hidden'
        >
          <div className='flex flex-col md:flex-row flex-1 gap-4 w-full h-full overflow-hidden'>
            {/* LEFT SIDE - ROLES */}
            <div className='w-full md:w-60 flex flex-col gap-2 p-3 border rounded-lg overflow-y-auto'>
              {roles.map(role => (
                <div
                  key={role}
                  className='flex items-center justify-between p-2 rounded-md border'
                >
                  {/* Role Select */}
                  <button
                    type='button'
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 text-left p-1 rounded ${
                      selectedRole === role ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {role}
                  </button>

                  {/* Delete Button */}
                  <button
                    type='button'
                    onClick={() => setDeleteOpen(true)}
                    className='text-red-500 text-sm ml-2'
                  >
                    <img src={deleteicon} alt='delete' className='w-6 h-6' />
                  </button>
                </div>
              ))}
            </div>

            {/* RIGHT SIDE - PERMISSIONS */}
            <div className='flex-1 border p-4 rounded-lg space-y-4 overflow-y-auto'>
              {modulesData.map(module => {
                const moduleState = rolePermissions[module.id] || {}

                return (
                  <div key={module.id} className='border rounded-lg p-3'>
                    {/* MODULE */}
                    <label className='flex items-center gap-2 font-semibold'>
                      <input
                        type='checkbox'
                        checked={moduleState.enabled || false}
                        onChange={() => toggleModule(module.id)}
                      />
                      {module.name}
                    </label>

                    {/* SUBMODULES */}
                    {moduleState.enabled && module.submodules?.length > 0 && (
                      <div className='ml-6 mt-3 space-y-2'>
                        {module.submodules.map(sub => {
                          const subKey = sub.id
                          const subLabel = sub.label

                          const subState =
                            moduleState.submodules?.[subKey] || {}

                          return (
                            <div key={subKey}>
                              <label className='flex items-center gap-2 text-sm'>
                                <input
                                  type='checkbox'
                                  checked={subState.enabled || false}
                                  onChange={() =>
                                    toggleSubmodule(module.id, subKey)
                                  }
                                />
                                {subLabel}
                              </label>

                              {/* ACTIONS */}
                              {subState.enabled &&
                                module.sub_submodules?.[subKey] && (
                                  <div className='ml-6 mt-1 flex flex-wrap gap-2'>
                                    {module.sub_submodules[subKey].map(
                                      action => {
                                        const actionKey = action.id
                                        const actionLabel = action.label

                                        return (
                                          <label
                                            key={actionKey}
                                            className='flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded'
                                          >
                                            <input
                                              type='checkbox'
                                              checked={
                                                subState.actions?.[actionKey] ||
                                                false
                                              }
                                              onChange={() =>
                                                toggleSubSubmodule(
                                                  module.id,
                                                  subKey,
                                                  actionKey
                                                )
                                              }
                                            />
                                            {actionLabel}
                                          </label>
                                        )
                                      }
                                    )}
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
        </form>
        <div className='flex justify-end mt-4 '>
          <Button
            form='role-permissions-form'
            size='addbutton'
            variant='default'
            type='submit'
          >
            Submit
          </Button>
        </div>

        <AddRole open={open} setOpen={setOpen} />
        <DeleteModal
          open={deleteOpen}
          setOpen={setDeleteOpen}
          header='Delete Role'
          description='Are you sure you want to delete this role? This action cannot be undone.'
          // onConfirm={handleDelete}
        />
      </div>
    </ContentLayout>
  )
}

export default RoleAndPermission
