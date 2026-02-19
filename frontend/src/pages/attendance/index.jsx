import CustomeTab from '@common/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import calender from '@assets/header-icons/calender.svg'
import { useState } from 'react'
import MemberAttendance from './MemberAttendance'
import EmployeeAttendance from './EmployeeAttendance'
import { Button } from '@pages/components/ui/button'
import AddEmployeeAttendance from './AddEmployeeAttendace'
import CustomFilter from '@common/CustomeFilter'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('Members')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  console.log('activeTab: ', activeTab)
  const employeeOrMember = [
    { id: 1, name: 'Members' },
    { id: 2, name: 'Employees' }
  ]

  const ROLES = [
  { label: 'Trainee', value: 'trainee' },
  { label: 'Employee', value: 'employee' },
  { label: 'Staff', value: 'staff' }
]

  return (
    <ContentLayout>
      <h1 className='text-2xl font-bold mb-4'>Attendance</h1>
      <div className='flex justify-between items-center mb-4'>
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='Members'
          tabsListClass='p-[1px]'
          onChange={value => setActiveTab(value)}
        />
        <div className='flex gap-2'>
          <button>
            <img
              src={calender}
              alt='calender'
              className='bg-primary p-2 rounded-md'
            />
          </button>
          {activeTab === 'Employees' && (
            <Button size='addbutton' onClick={() => setIsAddModalOpen(true)}>+ Add Attendance</Button>
          )}
          <CustomFilter onApply={filter => console.log(filter)} options={ROLES} />
        </div>
      </div>
      <div className='text-tabelsubtitle font-semibold text-lg mb-3'>
        {activeTab === 'Members'
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>
      {activeTab === 'Members' && <MemberAttendance />}
      {activeTab === 'Employees' && <EmployeeAttendance />}
      <AddEmployeeAttendance open={isAddModalOpen} setOpen={setIsAddModalOpen} />
    </ContentLayout>
  )
}
export default Attendance
