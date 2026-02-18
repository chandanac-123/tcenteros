const MultiColorProgressBar = ({
  segments = [], // [{ value: 30, role: "trainee" }, ...]
  height = "h-2",
}) => {


  return (
    <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden flex my-4`}>
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`${height} bg-${segment.role__color}`}
          style={{ width: `${segment.value}%` }}
        />
      ))}
    </div>
  )
}

export default MultiColorProgressBar
