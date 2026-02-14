import CustomeTab from '@common/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import calender from '@assets/header-icons/calender.svg'
import { useState } from 'react'
import MemberAttendance from './MemberAttendance'
import EmployeeAttendance from './EmployeeAttendance'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState(1)
  console.log('activeTab: ', activeTab)
  const employeeOrMember = [
    { id: 1, name: 'Members' },
    { id: 2, name: 'Employees' }
  ]

  return (
    <ContentLayout>
      <h1 className='text-2xl font-bold mb-4'>Attendance</h1>
      <div className='flex justify-between items-center mb-4'>
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal={1}
          tabsListClass='p-[1px]'
          onChange={id => setActiveTab(id)}
        />
        <button>
          <img
            src={calender}
            alt='calender'
            className='bg-primary p-2 rounded-md'
          />
        </button>
      </div>
      <div className='text-tabelsubtitle font-semibold text-lg mb-3'>
        {activeTab === 1
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>
      {activeTab === 1 && <MemberAttendance />}
      {activeTab === 2 && <EmployeeAttendance />}
    </ContentLayout>
  )
}
export default Attendance
