import { Search } from "lucide-react"


const CustomeSearch = ({placeholder}) => {
  return (
    <div className='relative w-full'>
      <span className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
        <Search className='text-textwhite w-5 h-5' />
      </span>
      <input
        type='text'
        placeholder={placeholder}
        className='border w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl border-textwhite text-textwhite rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-textwhite bg-search_bg text-sm font-light placeholder:text-textwhite'
      />
    </div>
  )
}

export default CustomeSearch
