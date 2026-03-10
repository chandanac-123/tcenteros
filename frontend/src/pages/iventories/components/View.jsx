import CustomeModal from '@common/CustomeModal'
import { Badge } from '@pages/components/ui/badge'
import { Spinner } from '@pages/components/ui/spinner'
import { useGetSaleByIdQuery } from '@api-queries/billing/Query'

const ViewForm = ({ open, setOpen, id }) => {
  console.log('id: ', id);
  const { data: saleData, isFetching: isSaleFetching } =
    useGetSaleByIdQuery(open ? id : null)
  console.log('saleData: ', saleData);

  return (
    <CustomeModal
      open={open}
      onOpenChange={setOpen}
      header='View Sale Details'
    >
      {isSaleFetching ? (
        <div className='flex justify-center items-center'>
          <Spinner />
        </div>
      ) : (
        <>
         

          {/* <div className='flex gap-10'>
            <div className='flex flex-col gap-2'>
              <span className='text-sm'>City</span>
              <span className='flex text-textgrey '>
                {employeeData?.address?.city}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-sm'>Pin</span>
              <span className='flex text-textgrey '>
                {employeeData?.address?.pin}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-sm'>Address</span>
              <span className='flex text-textgrey '>
                {employeeData?.address?.address}
              </span>
            </div>
          </div> */}

          {/* <div className='flex gap-10'>
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
                variant={
                  employeeData?.status === 'active' ? 'active' : 'inactive'
                }
              />
            </div>
          </div> */}
        </>
      )}
    </CustomeModal>
  )
}
export default ViewForm
