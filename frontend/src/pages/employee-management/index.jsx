/* eslint-disable no-unused-vars */
import { useState } from 'react'
import EmployeeTable from './table'
import MultiColorProgressBar from '@common/MulticolorProgressBar'
import CustomFilter from '@common/CustomeFilter'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import {
  useEmployeeQuery,
  useDeleteMultipleEmployeeMutation
} from '@api-queries/employee-management/Query'
import { Button } from '@pages/components/ui/button'

const EmployeeManagement = () => {
  const [open, setOpen] = useState(false)
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })
  const { data, isFetching } = useEmployeeQuery(tableParams)
  const handleOpen = () => {
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
          <Button onClick={handleOpen} size='addbutton'>
            + Add Employee
          </Button>
        </div>
      </div>

      <div className='w-full h-px bg-gray-300 my-4'></div>

      <div className='gap-2 flex items-center'>
        <span className='font-semibold text-3xl'>{data?.total_count}</span>
        <span className='text-textgrey'>Total Employees</span>
      </div>

      <div>
        <MultiColorProgressBar data={data?.employee_counts} />
      </div>

      <EmployeeTable
        data={data?.employees || []}
        tableParams={tableParams}
        pagination={data?.total_count}
        loading={isFetching}
        setTableParams={setTableParams}
      />
    </ContentLayout>
  )
}
export default EmployeeManagement
