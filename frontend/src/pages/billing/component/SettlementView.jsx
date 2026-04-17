import CustomeModal from '@common/components/CustomeModal'
import { useSettlementByIdQuery } from '@api-queries/billing/Query'

const SettlementViewPage = ({ open, setOpen, id }) => {
  const { data, isFetching } = useSettlementByIdQuery(id)

  const summary = data?.summary
  const income = data?.income_breakdown
  const expenses = data?.expenses_breakdown

  return (
    <CustomeModal header='Settlement Details' open={open} onOpenChange={setOpen}>
      {isFetching ? (
        <p className='text-sm text-gray-500'>Loading...</p>
      ) : (
        <div className='flex flex-col gap-6'>

          {/* Period */}
          <div>
            <h3 className='font-semibold text-base mb-2'>Period</h3>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
              <div className='flex flex-col'>
                <span className='text-xs text-textgrey'>Period Label</span>
                <span className='font-semibold'>{data?.period_label}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-xs text-textgrey'>Start Date</span>
                <span className='font-semibold'>{data?.period_start}</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-xs text-textgrey'>End Date</span>
                <span className='font-semibold'>{data?.period_end}</span>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className='font-semibold text-base mb-2'>Summary</h3>

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div className='flex flex-col'>
                <span>Total Income</span>
                <span className='font-semibold text-green-600'>
                  ₹ {summary?.total_income}
                </span>
              </div>

              <div className='flex flex-col'>
                <span>Total Expenses</span>
                <span className='font-semibold text-red_text'>
                  ₹ {summary?.total_expenses}
                </span>
              </div>

              <div className='flex flex-col'>
                <span>Net Amount</span>
                <span className='font-semibold'>
                  ₹ {summary?.net_amount}
                </span>
              </div>

              <div className='flex flex-col'>
                <span>Platform Fee</span>
                <span className='font-semibold'>
                  ₹ {summary?.platform_fee_total}
                </span>
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div>
            <h3 className='font-semibold text-base mb-2'>Income Breakdown</h3>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Incoming Visits</span>
                <span>Count: {income?.incoming_visits?.count}</span>
                <span>Total: ₹ {income?.incoming_visits?.total}</span>
              </div>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Membership Sales</span>
                <span>Count: {income?.membership_sales?.count}</span>
                <span>Total: ₹ {income?.membership_sales?.total}</span>
              </div>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Inventory Sales</span>
                <span>Count: {income?.inventory_sales?.count}</span>
                <span>Total: ₹ {income?.inventory_sales?.total}</span>
              </div>

            </div>
          </div>

          {/* Expense Breakdown */}
          <div>
            <h3 className='font-semibold text-base mb-2'>Expenses</h3>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Outgoing Visits</span>
                <span>Count: {expenses?.outgoing_visits?.count}</span>
                <span>Total: ₹ {expenses?.outgoing_visits?.total}</span>
              </div>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Employee Payroll</span>
                <span>Count: {expenses?.employee_payroll?.count}</span>
                <span>Total: ₹ {expenses?.employee_payroll?.total}</span>
              </div>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Branching Expenses</span>
                <span>Count: {expenses?.branching_expenses?.count}</span>
                <span>Total: ₹ {expenses?.branching_expenses?.total}</span>
              </div>

              <div className='border rounded-lg p-3 flex flex-col'>
                <span className='font-semibold'>Inventory Purchases</span>
                <span>Count: {expenses?.inventory_purchases?.count}</span>
                <span>Total: ₹ {expenses?.inventory_purchases?.total}</span>
              </div>

            </div>
          </div>

        </div>
      )}
    </CustomeModal>
  )
}

export default SettlementViewPage