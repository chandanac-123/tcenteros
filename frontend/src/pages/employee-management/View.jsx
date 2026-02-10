import CustomeModal from '@common/CustomeModal'
import { Badge } from '@pages/components/ui/badge'
import { useEmployeeGetByIdQuery } from '@api-queries/employee-management/Query'

const ViewForm = ({ open, setOpen, id }) => {
  const { data: employeeData, isFetching: isEmployeeFetching } =
    useEmployeeGetByIdQuery(id)
  console.log('employeeData: ', employeeData)

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='View Employee Details'
    >
      <div className='flex gap-10'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm'>Full Name</span>
          <span className='flex text-textgrey '>{employeeData?.full_name}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Designation</span>
          <span className='flex text-textgrey '>
            {employeeData?.designation_name}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Email</span>
          <span className='flex text-textgrey '>{employeeData?.email}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Phone</span>
          <span className='flex text-textgrey '>{employeeData?.mobile}</span>
        </div>
      </div>

      <div className='flex gap-10'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm'>Qualification</span>
          <span className='flex text-textgrey '>
            {employeeData?.qualification}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Total Experience</span>
          <span className='flex text-textgrey '>
            {employeeData?.qualification}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Country</span>
          <span className='flex text-textgrey '>{employeeData?.country}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>State</span>
          <span className='flex text-textgrey '>{employeeData?.state}</span>
        </div>
      </div>

      <div className='flex gap-10'>
        <div className='flex flex-col gap-2'>
          <span className='text-sm'>City</span>
          <span className='flex text-textgrey '>{employeeData?.city}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Pin</span>
          <span className='flex text-textgrey '>{employeeData?.pin}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Address</span>
          <span className='flex text-textgrey '>{employeeData?.address}</span>
        </div>
      </div>

      <div className='flex gap-10'>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Center</span>
          <span className='flex text-textgrey '>
            {employeeData?.center_name}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span>Join Date</span>
          <span className='flex text-textgrey '>
            {employeeData?.joining_date}
          </span>
        </div>
        <div className='flex flex-col gap-1'>
          <span className='text-sm'>Status</span>
          <Badge
            label={
              employeeData?.status === 'active'
                ? 'Active Member'
                : 'Inactive Member'
            }
            variant={employeeData?.status === 'active' ? 'active' : 'inactive'}
          />
        </div>
      </div>
    </CustomeModal>
  )
}
export default ViewForm
