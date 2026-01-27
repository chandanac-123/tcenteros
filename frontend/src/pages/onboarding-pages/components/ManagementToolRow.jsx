const ManagementToolRow = ({
  tool,
  checked,
  onToggle,
  onNavigate,
}) => {
  return (
    <div
      className={`
        flex items-center rounded-lg px-4 py-2 border-2 transition
        ${checked ? 'border-secondary bg-secondary/10' : 'border-bordergreylight'}
      `}
    >
      <span
        className='flex-1 cursor-pointer hover:underline'
        onClick={() => onNavigate(tool.route)}
      >
        {tool.label}
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
