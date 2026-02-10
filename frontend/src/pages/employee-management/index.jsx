import { useState } from 'react'
import EmployeeTable from './table'
import MultiColorProgressBar from '@common/MulticolorProgressBar'
import CustomFilter from '@common/CustomeFilter'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useEmployeeQuery } from '@api-queries/employee-management/Query'

const EmployeeManagement = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const {data, isFetching} = useEmployeeQuery()
  const [editId, setEditId] = useState(2)
  const [open, setOpen] = useState(false)

  const employeeOrCenter = [
    { id: 1, name: 'Center User' },
    { id: 2, name: 'Employee' }
  ]

  const handleOpen = () => {
    setEditId(1)
    setOpen(true)
  }

  return (
    <ContentLayout>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex flex-col'>
          <span>Employees</span>
          <span className='text-textgrey text-sm'>
            All Employees and Trainee Details
          </span>
        </div>
        <div className='flex-1 flex justify-end items-center gap-2'>
          <CustomFilter />
        </div>
      </div>

      <div className='w-full h-px bg-gray-300 my-4'></div>

      <div className='gap-2 flex items-center'>
        <span className='font-semibold text-3xl'>244</span>
        <span className='text-textgrey'>Total Employees</span>
      </div>

      <div>
        <MultiColorProgressBar
          segments={[
            { value: 60, role: 'trainee', role__color: 'progress_yellow' },
            { value: 30, role: 'employee', role__color: 'progress_green' },
            { value: 10, role: 'staff', role__color: 'progress_blue' }
          ]}
        />
      </div>

      <div className='gap-2 flex items-center mb-4'>
        <div className='flex items-center gap-2'>
          <span className='rounded-full w-3 h-3 bg-progress_yellow'></span>
          <span className='text-textgrey text-xs'>Total Trainers</span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-full w-3 h-3 bg-progress_green'></span>
          <span className='text-textgrey text-xs'>Physiotherapist </span>
        </div>
        <div className='flex items-center gap-2'>
          <span className='rounded-full w-3 h-3 bg-progress_blue'></span>
          <span className='text-textgrey text-xs'>New Staff Added</span>
        </div>
      </div>

      <EmployeeTable
        data={data}
        setOpen={setOpen}
        handleOpen={handleOpen}
        open={open}
        tableParams={tableParams}
        setTableParams={setTableParams}
      />
    </ContentLayout>
  )
}
export default EmployeeManagement
