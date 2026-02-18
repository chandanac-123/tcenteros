const RadioGroup = ({ name, options, value, onChange }) => (
  <div className="flex flex-col gap-3 mt-2">
    {options.map(opt => (
      <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          className="w-4 h-4 accent-secondary"
        />
        <span className="text-sm">{opt.label}</span>
      </label>
    ))}
  </div>
);
export default RadioGroup;