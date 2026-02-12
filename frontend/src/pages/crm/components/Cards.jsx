const Card = ({ label }) => {
  return (
    <div className='w-56 flex gap-4 items-center p-2 bg-textwhite rounded-md shadow-md'>
      <span className='text-md font-semibold'>{label}</span>
      <span className='text-base bg-primarybglight py-1 px-2 rounded-xl font-semibold  text-primary'>
        3ss
      </span>
    </div>
  )
}

export default Card
