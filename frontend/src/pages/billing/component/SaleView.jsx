import CustomeModal from '@common/components/CustomeModal'
import { useGetAllSaleByIdQuery } from '@api-queries/center-admin/billing/Query'

const SaleViewPage = ({ open, setOpen, id }) => {
  const { data, isFetching } = useGetAllSaleByIdQuery(id)

  const sale = data

  return (
    <CustomeModal header='Sale Details' open={open} onOpenChange={setOpen}>
      {isFetching ? (
        <p className='text-sm text-gray-500'>Loading...</p>
      ) : (
        <div className='flex flex-col gap-4'>
          {/* Invoice Info */}

          <div className='grid grid-cols-4 gap-3 text-sm'>
            <span className='font-medium'>Invoice Number:</span>{' '}
            {sale?.invoice_number}
            <span className='font-medium'>Order Type:</span> {sale?.type_label}
            <span className='font-medium'>Source:</span> {sale?.source_label}
            <span className='font-medium'>Date:</span> {sale?.date}
            <span className='font-medium'>Payment Method:</span>{' '}
            {sale?.payment_method}
            <span className='font-medium'>Payment Status:</span>{' '}
            {sale?.payment_status}
            <span className='font-medium'>Name:</span>{' '}
            {sale?.customer?.full_name}
            <span className='font-medium'>Email:</span> {sale?.customer?.email}
            <span className='font-medium'>Mobile:</span>{' '}
            {sale?.customer?.mobile || 'N/A'}
            <span className='font-medium'>Center Name:</span>{' '}
            {sale?.center?.name}
            <span className='font-medium'>Email:</span> {sale?.center?.email}
            <span className='font-medium'>Phone:</span> {sale?.center?.phone}
            <span className='font-medium'>Subtotal:</span> ₹
            {sale?.subtotal_amount}
            <span className='font-medium'>Tax:</span> ₹{sale?.tax_amount}
            <p className='col-span-2 text-base font-semibold  '>
              Total: ₹{sale?.total_amount}
            </p>
          </div>
        </div>
      )}
    </CustomeModal>
  )
}

export default SaleViewPage
