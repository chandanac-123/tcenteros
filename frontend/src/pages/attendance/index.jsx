import CustomeTab from '@common/CustomeTab'
import ContentLayout from '@common/MasterLayout/ContentLayout'

const Attendance = () => {
  const employeeOrMember = [
    { id: 1, name: 'Member' },
    { id: 2, name: 'Employee' }
  ]
  return (
    <ContentLayout>
      <div className='flex '>
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='Member'
          tabsListClass='p-[1px]'
        />
      </div>
    </ContentLayout>
  )
}
export default Attendance
