import CustomeModal from '@common/components/CustomeModal'
import { Badge } from '@pages/components/ui/badge'
import { Spinner } from '@pages/components/ui/spinner'
import { useGetSaleByIdQuery } from '@api-queries/billing/Query'

const ViewForm = ({ open, setOpen, id }) => {
  const { data: saleData, isFetching } =
    useGetSaleByIdQuery(open ? id : null)

  return (
    <CustomeModal open={open} onOpenChange={setOpen} header="View Sale Details">
      {isFetching ? (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* SALE INFO */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Sale Number</span>
              <span className="text-textgrey">{saleData?.sale_number}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm">Status</span>
              <Badge
                label={saleData?.status}
                variant={saleData?.status === "completed" ? "active" : "inactive"}
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm">Payment Status</span>
              <span className="text-textgrey">{saleData?.payment_status}</span>
            </div>
          </div>

          {/* AMOUNT DETAILS */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-1">
              <span className="text-sm">Date</span>
              <span className="text-textgrey">{saleData?.created_at?.split('T')[0]}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm">Subtotal</span>
              <span className="text-textgrey">₹{saleData?.subtotal}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm">Tax</span>
              <span className="text-textgrey">₹{saleData?.tax}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm ">Total</span>
              <span className="text-textgrey">
                ₹{saleData?.total}
              </span>
            </div>
          </div>

          {/* PRODUCTS */}
          <div className="flex flex-col gap-3">
            <span className="font-semibold">Products</span>

            {saleData?.items?.map(item => (
              <div
                key={item.item_id}
                className="flex justify-between border border-tableborder rounded-lg p-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-xs text-textgrey">
                    {item.sku_code}
                  </span>
                </div>

                <div className="flex flex-col text-right">
                  <span>Qty: {item.quantity}</span>
                  <span>₹{item.unit_price}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </CustomeModal>
  )
}

export default ViewForm