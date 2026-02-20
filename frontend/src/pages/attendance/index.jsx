import CustomeTab from '@common/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import calender from '@assets/header-icons/calender.svg'
import { useState } from 'react'
import MemberAttendance from './MemberAttendance'
import EmployeeAttendance from './EmployeeAttendance'
import { Button } from '@pages/components/ui/button'
import AddEmployeeAttendance from './AddEmployeeAttendace'
import CustomFilter from '@common/CustomeFilter'
import { useCategoriesQuery } from '@api-queries/employee-management/Query'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('Members')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data, isLoading } = useCategoriesQuery()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  console.log('data: ', data)
  console.log('activeTab: ', activeTab)
  const employeeOrMember = [
    { id: 1, name: 'Members' },
    { id: 2, name: 'Employees' }
  ]

  return (
    <ContentLayout>
      <h1 className='text-xl font-semibold text-textblack mb-4'>Attendance</h1>
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
            <>
              <Button size='addbutton' onClick={() => setIsAddModalOpen(true)}>
                + Add Attendance
              </Button>

              <CustomFilter
                 onApply={id => setSelectedCategoryId(id)}
                options={data?.map(category => ({
                  label: category.name,
                  value: category.id
                }))}
              />
            </>
          )}
        </div>
      </div>
      <div className='text-tabelsubtitle font-semibold text-md mb-3'>
        {activeTab === 'Members'
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>
      {activeTab === 'Members' && <MemberAttendance />}
      {activeTab === 'Employees' && <EmployeeAttendance categoryId={selectedCategoryId}/>}
      <AddEmployeeAttendance
        open={isAddModalOpen}
        setOpen={setIsAddModalOpen}
      />
    </ContentLayout>
  )
}
export default Attendance
