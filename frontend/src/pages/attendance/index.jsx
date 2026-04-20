import CustomeTab from '@common/components/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useState } from 'react'
import MemberAttendance from './MemberAttendance'
import EmployeeAttendance from './EmployeeAttendance'
import { Button } from '@pages/components/ui/button'
import AddEmployeeAttendance from './AddEmployeeAttendace'
import CustomFilter from '@common/components/CustomeFilter'
import { useCategoriesQuery } from '@api-queries/center-admin/employee-management/Query'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { formatRange } from '@utils/helper'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('members')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data, isLoading } = useCategoriesQuery()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [dateRanges, setDateRanges] = useState({
    members: { from: null, to: null },
    employees: { from: null, to: null }
  })

  const employeeOrMember = [
    { id: 'members', name: 'Members' },
    { id: 'employees', name: 'Employees' }
  ]

  return (
    <ContentLayout>
      <h1 className='text-xl font-semibold text-textblack mb-4'>Attendance</h1>
      <div className='flex justify-between items-center mb-4'>
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='members'
          tabsListClass='p-[1px]'
          onChange={value => setActiveTab(value)}
        />
        <div className='flex gap-2'>
          <CustomDatePicker
            pickerType='range'
            value={dateRanges[activeTab]}
            onChange={range =>
              setDateRanges(prev => ({
                ...prev,
                [activeTab]: range
              }))
            }
          />
          {activeTab === 'employees' && (
            <div className='flex gap-2'>
              <CustomFilter
                onApply={id => setSelectedCategoryId(id)}
                options={data?.map(category => ({
                  label: category.name,
                  value: category.id
                }))}
              />
               <Button size='addbutton' onClick={() => setIsAddModalOpen(true)}>
                + Add Attendance
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className='text-tabelsubtitle font-semibold text-md mb-3'>
        {activeTab === 'members'
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>
      {activeTab === 'members' && (
        <MemberAttendance dateRange={formatRange(dateRanges.members)} />
      )}

      {activeTab === 'employees' && (
        <EmployeeAttendance
          categoryId={selectedCategoryId}
          dateRange={formatRange(dateRanges.employees)}
        />
      )}
      <AddEmployeeAttendance
        open={isAddModalOpen}
        setOpen={setIsAddModalOpen}
      />
    </ContentLayout>
  )
}
export default Attendance
