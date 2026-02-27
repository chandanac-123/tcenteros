import { useState } from 'react'
import CustomFilter from '@common/CustomeFilter'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Button } from '@pages/components/ui/button'
import CustomeTab from '@common/CustomeTab'
import SalaryStructure from './salary-structure'
import Employee from './employee'
import AddEditForm from './employee/AddEditForm'
import StructureAddEdit from './salary-structure/AddEdit'

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState('Employee')
  const [open, setOpen] = useState(false)
  const [structureOpen, setStructureOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }
  const employeeOrCenter = [
    { id: 1, name: 'Employee' },
    { id: 2, name: 'Salary Structure' }
  ]

  return (
    <ContentLayout>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex flex-col'>
          <span>Employees</span>
          <span className='text-textgrey text-sm'>
            All Employees and Trainee Details
          </span>
        </div>
        <div className='flex-1 flex justify-end items-center gap-2'>
          <CustomFilter />
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
      <CustomeTab
        tabList={employeeOrCenter}
        defaultVal='Employee'
        tabsListClass=' w-[400px] p-[1px]'
        onChange={value => setActiveTab(value)}
      />
      <div className='w-full h-px bg-gray-300 my-4'></div>
      
      {activeTab === 'Employee' ? (
        <Employee open={open} setOpen={setOpen} />
      ) : (
        <SalaryStructure />
      )}
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
    </ContentLayout>
  )
}
export default EmployeeManagement
