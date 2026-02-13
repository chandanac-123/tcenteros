const Card = ({ label, value = 35420 }) => {
  return (
    <div className="h-16 w-full flex items-center justify-between px-4 bg-textwhite rounded-xl shadow-md">
      <span className="text-sm font-medium leading-tight whitespace-pre-line">
        {label}
      </span>

      <span className="text-sm bg-primarybglight py-1 px-3 rounded-xl font-semibold text-primary">
        {value}
      </span>
    </div>
  )
}

export default Card
