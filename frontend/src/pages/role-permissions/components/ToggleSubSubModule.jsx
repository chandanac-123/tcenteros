export const toggleSubSubmodule = (moduleId, subId, actionId) => {
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
