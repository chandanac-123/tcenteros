import { featureNameToStoreKey } from "@constants/managementTool"

const ManagementToolRow = ({ tool, checked, onToggle, onNavigate }) => {
  console.log('tool: ', tool)
  const route = tool?.route || featureNameToStoreKey[tool?.feature_name] || '/'
  

  return (
    <div
      className={`
        flex items-center rounded-lg px-4 py-2 border-2 transition
        ${
          checked
            ? 'border-secondary bg-secondary/10'
            : 'border-bordergreylight'
        }
      `}
    >
      <span
        className='flex-1 cursor-pointer'
        onClick={() => onNavigate(route, tool)}
      >
        {tool.feature_name}
      </span>

      <input
        type='checkbox'
        checked={checked}
        onChange={e => onToggle(tool.id, e.target.checked)}
        className='w-4 h-4 cursor-pointer accent-secondary'
      />
    </div>
  )
}

export default ManagementToolRow
