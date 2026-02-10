import { Pencil, Trash2 } from 'lucide-react'
import { useCreateCategoryMutation } from '@api-queries/employee-management/Query'
import {
  useCategoriesQuery,
  useDeleteCategoryMutation,
} from '@api-queries/employee-management/Query'
import { useState } from 'react'
import AddCategory from '@pages/employee-management/AddCategory'
import DeleteModal from '@common/CustomeDelete'

const CenterDesignations = () => {
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [value, setValue] = useState('')
  const [delValue, setDelValue] = useState('')
  const { data, isFetching } = useCategoriesQuery()
  const { mutateAsync: createCategory, isPending } = useCreateCategoryMutation()
  const { mutateAsync: deleteCategory, isPending: isDeleting } =
    useDeleteCategoryMutation()

  const handleDelete = () => {
    if (delValue) {
      deleteCategory(delValue)
      setDeleteOpen(false)
      setValue('')
    }
  }

  return (
    <div>
      <div className='text-lg font-semibold mb-6'>Added Designations</div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {data?.map(d => (
          <div
            key={d.id}
            className='rounded-xl border border-gray-300 gap-3 bg-white shadow-sm flex items-center p-4 min-w-[220px] max-w-xs mx-auto'
          >
            <img
              src={d.img}
              alt={d.name}
              className='w-16 h-16 object-cover rounded-xl mb-2'
            />
            <div className='flex flex-col gap-3'>
              <div className='font-medium text-base mb-3 text-center w-full'>
                {d.name}
              </div>
              <div className='flex gap-3 w-full justify-center'>
                <button
                  type='button'
                  onClick={() => {
                    setValue(d.id)
                    setCategoryOpen(!categoryOpen)
                  }}
                  className='bg-[#F3E8FF] text-primary p-2 rounded-md hover:bg-primary/10 transition'
                >
                  <Pencil className='w-5 h-5' />
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setDelValue(d.id)
                    setDeleteOpen(true)
                  }}
                  className='bg-[#FFE4E6] text-red-500 p-2 rounded-md hover:bg-red-100 transition'
                >
                  <Trash2 className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddCategory
        categoryOpen={categoryOpen}
        setCategoryOpen={setCategoryOpen}
        id={value}
      />
      <DeleteModal
        open={deleteOpen}
        setOpen={setDeleteOpen}
        header='Are you sure you want to delete this Designation?'
        description='This designation will be removed from your active Categories and you wont be able designate the employee. This action cannot be undone.'
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default CenterDesignations
