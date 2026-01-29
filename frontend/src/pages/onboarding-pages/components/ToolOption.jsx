const ToolOption = ({ tool, selected, onToggle }) => {
  const inputId = `tool-checkbox-${tool.id}`
  
  return (
    <label
      htmlFor={inputId}
      className={`
        flex items-center border-2 rounded-lg px-4 py-3 cursor-pointer transition
        ${selected ? 'border-primary bg-primary/5' : 'border-bordergreylight'}
      `}
    >
      <img
        src={selected ? tool.light : tool.dark}
        alt={tool.label}
        className='w-6 h-6 mr-3'
      />

      <span className='flex-1'>{tool.label}</span>

      <input
        id={inputId}
        type='checkbox'
        checked={selected}
        onChange={() => onToggle(tool.id)}
        className='w-4 h-4'
      />
    </label>
  )
}

export default ToolOption
