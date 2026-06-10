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
  const { data } = useCategoriesQuery()
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
      {/* Title */}
      <h1 className='text-lg sm:text-xl font-semibold text-textblack mb-4'>
        Attendance
      </h1>

      {/* Header Section */}
      <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4'>
        {/* Tabs */}
        <div className='w-full lg:w-auto overflow-x-auto'>
          <CustomeTab
            tabList={employeeOrMember}
            defaultVal='members'
            tabsListClass='p-[1px] w-full sm:w-fit min-w-[250px]'
            onChange={value => setActiveTab(value)}
          />
        </div>

        {/* Filters */}
        <div className='flex flex-col sm:flex-row gap-2 w-full lg:w-auto'>
          <div className='w-full sm:w-auto'>
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
          </div>

          {activeTab === 'employees' && (
            <>
              <div className='w-full sm:w-auto'>
                <CustomFilter
                  onApply={id => setSelectedCategoryId(id)}
                  options={data?.map(category => ({
                    label: category.name,
                    value: category.id
                  }))}
                />
              </div>

              <Button
                size='addbutton'
                className='w-full sm:w-auto justify-center'
                onClick={() => setIsAddModalOpen(true)}
              >
                + Add Attendance
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Table Heading */}
      <div className='text-tabelsubtitle font-semibold text-sm sm:text-md mb-3'>
        {activeTab === 'members'
          ? 'Member Attendance History'
          : 'Employee Attendance History'}
      </div>

      {/* Content */}
      <div className='overflow-x-auto'>
        {activeTab === 'members' && (
          <MemberAttendance dateRange={formatRange(dateRanges.members)} />
        )}

        {activeTab === 'employees' && (
          <EmployeeAttendance
            categoryId={selectedCategoryId}
            dateRange={formatRange(dateRanges.employees)}
          />
        )}
      </div>

      {/* Modal */}
      <AddEmployeeAttendance
        open={isAddModalOpen}
        setOpen={setIsAddModalOpen}
      />
    </ContentLayout>
  )
}

export default Attendance