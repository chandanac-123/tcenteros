import { Search } from 'lucide-react'

const CustomeSearch = ({ value, onChange }) => {
  return (
    <div className='relative w-1/3'>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4' />

      <input
        type='text'
        placeholder='Search...'
        value={value}
        onChange={onChange}
        className='w-full border border-tableborder rounded-lg pl-10 pr-4 py-2 text-black bg-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-gray-400'
      />
    </div>
  )
}

export default CustomeSearch
