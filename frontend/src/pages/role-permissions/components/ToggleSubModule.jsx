 export const toggleSubmodule = (moduleId, subId) => {
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