export const toggleModule = moduleId => {
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