import React, { useState } from 'react'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { modulesData } from './components/ModuleData'
import { Button } from '@pages/components/ui/button'
import AddRole from './components/AddRole'
import { useFormik } from 'formik'
import deleteicon from '@assets/form-icons/delete.svg'
import DeleteModal from '@common/components/CustomeDelete'
import AddCategory from '@pages/employee-management/category/AddCategory'

const roles = ['Admin', 'Branch Manager', 'Trainer', 'Staff']

const RoleAndPermission = () => {
  const [open, setOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [permissions, setPermissions] = useState({})
  const [selectedRole, setSelectedRole] = useState('Admin')
  const [openModules, setOpenModules] = useState({})

  const toggleCollapse = moduleId => {
    setOpenModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }))
  }

  const formik = useFormik({
    initialValues: { role: '' },
    onSubmit: async () => {
      const roleData = permissions[selectedRole] || {}
      const payload = {}

      modulesData.forEach(module => {
        const moduleState = roleData[module.id]
        if (!moduleState?.enabled) return

        const modulePayload = { enabled: true, submodules: {} }

        module.submodules?.forEach(sub => {
          const subState = moduleState?.submodules?.[sub.id]
          if (!subState?.enabled) return

          if (module.sub_submodules?.[sub.id]) {
            const actions = {}
            module.sub_submodules[sub.id].forEach(a => {
              if (subState.actions?.[a.id]) actions[a.id] = true
            })
            if (Object.keys(actions).length > 0) {
              modulePayload.submodules[sub.id] = actions
            }
          } else {
            modulePayload.submodules[sub.id] = true
          }
        })

        payload[module.id] = modulePayload
      })

      console.log('FINAL CLEAN PAYLOAD 👉', payload)
    }
  })

  const toggleModule = moduleId => {
    setPermissions(prev => {
      const currentEnabled = prev[selectedRole]?.[moduleId]?.enabled
      const module = modulesData.find(m => m.id === moduleId)

      let submodules = {}

      if (!currentEnabled) {
        module?.submodules?.forEach(sub => {
          if (module.sub_submodules?.[sub.id]) {
            const actions = {}
            module.sub_submodules[sub.id].forEach(action => {
              actions[action.id] = true
            })
            submodules[sub.id] = { enabled: true, actions }
          } else {
            submodules[sub.id] = { enabled: true }
          }
        })
      }

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: !currentEnabled,
            submodules: !currentEnabled ? submodules : {}
          }
        }
      }
    })
  }

  const toggleSubmodule = (moduleId, subId) => {
    setPermissions(prev => {
      const moduleState = prev[selectedRole]?.[moduleId] || {}
      const submodules = moduleState.submodules || {}

      const current = submodules?.[subId]?.enabled

      const updatedSubmodules = {
        ...submodules,
        [subId]: {
          enabled: !current,
          actions: submodules?.[subId]?.actions || {}
        }
      }

      const anyEnabled = Object.values(updatedSubmodules).some(
        sub => sub.enabled
      )

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: anyEnabled,
            submodules: updatedSubmodules
          }
        }
      }
    })
  }

  const toggleSubSubmodule = (moduleId, subId, actionId) => {
    setPermissions(prev => {
      const moduleState = prev[selectedRole]?.[moduleId] || {}
      const submodules = moduleState.submodules || {}
      const subState = submodules?.[subId] || {}

      const updatedActions = {
        ...subState.actions,
        [actionId]: !subState.actions?.[actionId]
      }

      const anyActionEnabled = Object.values(updatedActions).some(v => v)

      const updatedSubmodules = {
        ...submodules,
        [subId]: {
          enabled: anyActionEnabled,
          actions: updatedActions
        }
      }

      const anySubEnabled = Object.values(updatedSubmodules).some(
        sub => sub.enabled
      )

      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [moduleId]: {
            enabled: anySubEnabled,
            submodules: updatedSubmodules
          }
        }
      }
    })
  }

  const rolePermissions = permissions[selectedRole] || {}

  const isIndeterminate = module => {
    const moduleState = rolePermissions[module.id]
    if (!moduleState?.submodules) return false

    const subs = Object.values(moduleState.submodules)
    const someChecked = subs.some(s => s.enabled)
    const allChecked = subs.every(s => s.enabled)

    return someChecked && !allChecked
  }

  return (
    <ContentLayout>
      <div className='h-full flex flex-col'>
        <div className='flex justify-between mb-4'>
          <span className='text-xl font-semibold text-textblack'>
            Role and Permissions
          </span>
          <Button size='addbutton' onClick={() => setOpen(true)}>
            + Create new Designation
          </Button>
        </div>

        <form onSubmit={formik.handleSubmit} className='flex-1 overflow-hidden'>
          <div className='flex flex-col md:flex-row flex-1 gap-4 w-full h-full overflow-hidden'>
            {/* LEFT */}
            <div className='w-full md:w-60 flex flex-col gap-2 p-3 border rounded-lg overflow-y-auto'>
              {roles.map(role => (
                <button
                  key={role}
                  type='button'
                  onClick={() => setSelectedRole(role)}
                  className={`block w-full text-left p-2 mb-2 ${
                    selectedRole === role ? 'bg-primary text-white' : ''
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* RIGHT */}
            <div className='flex-1 space-y-3 overflow-y-auto'>
              {modulesData.map(module => {
                const moduleState = rolePermissions[module.id] || {}
                const isOpen = openModules[module.id]

                return (
                  <div key={module.id} className='border rounded'>
                    {!module.submodules?.length ? (
                      // ✅ NO SUBMODULE → SIMPLE ROW
                      <div className='flex items-center gap-2 p-3'>
                        <input
                          type='checkbox'
                          checked={moduleState.enabled || false}
                          onChange={() => toggleModule(module.id)}
                        />
                        <span className='font-semibold'>{module.name}</span>
                      </div>
                    ) : (
                      // ✅ HAS SUBMODULE → COLLAPSE UI
                      <>
                        {/* HEADER */}
                        <div
                          className='flex items-center justify-between p-3 cursor-pointer bg-gray-100'
                          onClick={() => toggleCollapse(module.id)}
                        >
                          <div className='flex items-center gap-2'>
                            <input
                              type='checkbox'
                              checked={moduleState.enabled || false}
                              ref={el => {
                                if (el) {
                                  el.indeterminate = isIndeterminate(module)
                                }
                              }}
                              onChange={e => {
                                e.stopPropagation()
                                toggleModule(module.id)
                              }}
                            />
                            <span className='font-semibold'>{module.name}</span>
                          </div>

                          <span>{isOpen ? '−' : '+'}</span>
                        </div>

                        {/* BODY */}
                        {isOpen && (
                          <div className='p-3'>
                            {module.submodules.map(sub => {
                              const subState =
                                moduleState.submodules?.[sub.id] || {}

                              return (
                                <div key={sub.id} className='ml-4 mb-2'>
                                  <label className='flex items-center gap-2'>
                                    <input
                                      type='checkbox'
                                      checked={subState.enabled || false}
                                      onChange={() =>
                                        toggleSubmodule(module.id, sub.id)
                                      }
                                    />
                                    {sub.label}
                                  </label>

                                  {subState.enabled &&
                                    module.sub_submodules?.[sub.id] && (
                                      <div className='ml-6 mt-1 flex flex-wrap gap-4'>
                                        {module.sub_submodules[sub.id].map(
                                          a => (
                                            <label
                                              key={a.id}
                                              className='flex gap-1'
                                            >
                                              <input
                                                type='checkbox'
                                                checked={
                                                  subState.actions?.[a.id] ||
                                                  false
                                                }
                                                onChange={() =>
                                                  toggleSubSubmodule(
                                                    module.id,
                                                    sub.id,
                                                    a.id
                                                  )
                                                }
                                              />
                                              {a.label}
                                            </label>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </form>

        <div className='flex justify-end mt-4 '>
          {' '}
          <Button
            form='role-permissions-form'
            size='addbutton'
            variant='default'
            type='submit'
          >
            {' '}
            Submit{' '}
          </Button>{' '}
        </div>

        <AddCategory categoryOpen={open} setCategoryOpen={setOpen} />
        <DeleteModal open={deleteOpen} setOpen={setDeleteOpen} />
      </div>
    </ContentLayout>
  )
}

export default RoleAndPermission
