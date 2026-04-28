const ManagementToolRow = ({
  tool,
  checked,
  onToggle,
  isMandatory
}) => {
  return (
    <div
      className={`
        flex items-center rounded-lg px-4 py-2 border-2 transition
        ${
          checked
            ? 'border-onboard_secondary bg-onboard_secondary/10'
            : 'border-bordergreylight'
        }
      `}
    >
      <span
        className={`flex-1 ${
          isMandatory ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        }`}
        // onClick={() =>
        //   !isMandatory && onNavigate && onNavigate(route, tool)
        // }
      >
        {tool.feature_name}
        {isMandatory && (
          <span className="ml-2 text-xs text-secondary">
           
          </span>
        )}
      </span>

      <input
        type='checkbox'
        checked={checked}
        disabled={isMandatory}
        onChange={e => onToggle(tool.id, e.target.checked)}
        className={`w-4 h-4 accent-onboard_secondary ${
          isMandatory ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
        }`}
      />
    </div>
  )
}

export default ManagementToolRow
