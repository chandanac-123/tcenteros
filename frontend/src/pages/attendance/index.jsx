import CustomeTab from '@common/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useState } from 'react'
import MemberAttendance from './MemberAttendance'
import EmployeeAttendance from './EmployeeAttendance'
import { Button } from '@pages/components/ui/button'
import AddEmployeeAttendance from './AddEmployeeAttendace'
import CustomFilter from '@common/CustomeFilter'
import { useCategoriesQuery } from '@api-queries/employee-management/Query'
import CustomDatePicker from '@common/CustomeDatepicker'
import { formatRange } from '@utils/helper'

const Attendance = () => {
  const [activeTab, setActiveTab] = useState('Members')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { data, isLoading } = useCategoriesQuery()
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [dateRanges, setDateRanges] = useState({
    Members: { from: null, to: null },
    Employees: { from: null, to: null }
  })

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
          {activeTab === 'Employees' && (
            <div className='flex gap-2'>
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
            </div>
          )}
        </div>
      </div>
      <div className='text-tabelsubtitle font-semibold text-md mb-3'>
        {activeTab === 'Members'
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>
      {activeTab === 'Members' && (
        <MemberAttendance dateRange={formatRange(dateRanges.Members)} />
      )}

      {activeTab === 'Employees' && (
        <EmployeeAttendance
          categoryId={selectedCategoryId}
          dateRange={formatRange(dateRanges.Employees)}
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
