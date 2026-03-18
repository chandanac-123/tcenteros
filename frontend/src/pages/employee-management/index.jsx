import { useState } from 'react'
import CustomFilter from '@common/components/CustomeFilter'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Button } from '@pages/components/ui/button'
import CustomeTab from '@common/components/CustomeTab'
import SalaryStructure from './salary-structure'
import Employee from './employee'
import AddEditForm from './employee/AddEditForm'
import StructureAddEdit from './salary-structure/AddEdit'
import { useAllCentersQuery } from '@api-queries/center-profile/Query'
import Payroll from './payroll'

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('Employee')
  const [open, setOpen] = useState(false)
  const [structureOpen, setStructureOpen] = useState(false)
  const { data: centersData, isFetching: isCentersFetching } =
    useAllCentersQuery()
  console.log('centersData: ', centersData)
  const [tableParams, setTableParams] = useState({
    page: 1,
    search: ''
  })

  const handleOpen = () => {
    setOpen(true)
  }
  const employeeOrCenter = [
    { id: 1, name: 'Employee' },
    { id: 2, name: 'Salary Structure' },
    { id: 3, name: 'Payroll' }
  ]

  return (
    <ContentLayout>
      <div className='flex justify-between items-center'>
        <div className='flex flex-col'>
          <span>Employees</span>
          <span className='text-textgrey text-sm'>
            All Employees and Trainee Details
          </span>
        </div>
        <div className='flex-1 flex justify-end items-center gap-2'>
          <CustomFilter
            options={centersData?.centers}
            onApply={value =>
              setTableParams(prev => ({ ...prev, payment_status: value }))
            }
          />
          {activeTab === 'Employee' && (
            <Button onClick={handleOpen} size='addbutton'>
              + Add Employee
            </Button>
          )}
          {activeTab === 'Salary Structure' && (
            <Button onClick={() => setStructureOpen(true)} size='addbutton'>
              + Add Salary Structure
            </Button>
          )}
        </div>
      </div>
      <div className=' gap-4 mt-4 flex flex-col'>
        <CustomeTab
          tabList={employeeOrCenter}
          defaultVal='Employee'
          tabsListClass=' w-[400px] p-[1px]'
          onChange={value => setActiveTab(value)}
        />

        {activeTab === 'Employee' && (
          <Employee
            open={open}
            setOpen={setOpen}
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {activeTab === 'Salary Structure' && <SalaryStructure />}
        {activeTab === 'Payroll' && <Payroll />}
        <AddEditForm
          open={open}
          setOpen={setOpen}
          closeModal={() => setOpen(false)}
        />
        <StructureAddEdit
          open={structureOpen}
          setOpen={setStructureOpen}
          closeModal={() => setStructureOpen(false)}
        />
      </div>
    </ContentLayout>
  )
}
export default EmployeeManagement
