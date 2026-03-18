import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Card } from '@pages/components/ui/card'
import SummaryCard from './components/SummaryCard'
import AccountSubCard from './components/AccountSubCard'
import { useNavigate } from 'react-router-dom'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import BarChart from '@common/charts/BarChart'
import PieChart from '@common/charts/PieChart'
import { useAccountsOverviewQuery } from '@api-queries/accounts/Query'

const Accounts = () => {
  const { data, isLoading, isError } = useAccountsOverviewQuery()
  console.log('data: ', data)

  const revenueLabels = data?.revenue_trend?.map(i => i.month) || []
  const incomeData = data?.revenue_trend?.map(i => i.income) || []

  const expenseData = data?.revenue_trend?.map(i => i.expense) || []

  const navigate = useNavigate()

  const summaryData = [
    { title: 'Total Income', amount: data?.totals?.income },
    { title: 'Total Expense', amount: data?.totals?.expense },
    { title: 'GST Payable', amount: data?.totals?.gst_payable },
    { title: 'Payroll', amount: data?.totals?.payroll_expense }
  ]
  const colorPalette = [
    {
      bg: 'bg-plan_bg_grey',
      text: 'text-plan_grey',
      border: 'border-plan_grey'
    },
    {
      bg: 'bg-plan_bg_green',
      text: 'text-plan_green',
      border: 'border-plan_green'
    },
    {
      bg: 'bg-plan_bg_blue',
      text: 'text-plan_blue',
      border: 'border-plan_blue'
    },
    {
      bg: 'bg-plan_bg_purple',
      text: 'text-plan_purple',
      border: 'border-plan_purple'
    }
  ]

  const incomeDataConfig = [
    {
      key: 'membership',
      label: 'Membership ',
      value: data?.income_breakdown?.membership?.value,
      color: '#8A00FF'
    },
    {
      key: 'networking',
      label: 'Networking ',
      value: data?.income_breakdown?.network?.value,
      color: '#EB4824'
    },
    {
      key: 'inventory',
      label: 'Inventory Sales',
      value: data?.income_breakdown?.inventory_sales?.value,
      color: '#FFCD0F'
    },
    {
      key: 'other',
      label: 'Other Income',
      value: data?.income_breakdown?.other?.value,
      color: '#A3AED0'
    }
  ]

  const expenseDataConfig = [
    {
      key: 'networking',
      label: 'Networking ',
      value: data?.expense_breakdown?.networking?.value,
      color: '#3B82F6'
    },
    {
      key: 'branching',
      label: 'Branching',
      value: data?.expense_breakdown?.branching?.value,
      color: '#EF4444'
    },
    {
      key: 'salary',
      label: 'Salary ',
      value: data?.expense_breakdown?.salary?.value,
      color: '#F59E0B'
    },
    {
      key: 'inventory',
      label: 'Inventory Purchase',
      value: data?.expense_breakdown?.inventory_purchase?.value,
      color: '#F59E0B'
    },
    {
      key: 'other',
      label: 'Other ',
      value: data?.expense_breakdown?.other?.value,
      color: '#10B981'
    }
  ]

  return (
    <ContentLayout>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-4 lg:min-h-[88vh]'>
        <div className='lg:col-span-3 flex flex-col gap-4"'>
          <Card className=''>
            <div className='flex flex-col p-4 h-full'>
              <span className='text-lg font-semibold text-textblack'>
                Account Overview
              </span>

              <div className='grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-4 gap-4'>
                {summaryData.map((item, index) => (
                  <SummaryCard
                    key={index}
                    title={item.title}
                    amount={item.amount}
                    colorTheme={`${colorPalette[index].bg} ${colorPalette[index].text} ${colorPalette[index].border}`}
                  />
                ))}
              </div>
              <div className='flex justify-between py-4'>
                <span className='text-lg font-semibold text-textblack'>
                  Monthly Income Vs Expenses
                </span>
                <span>
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <BarChart
                labels={revenueLabels}
                datasets={[
                  {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#15CAB8'
                  },
                  {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#377CF6'
                  }
                ]}
              />
            </div>
          </Card>

          <Card className=''>
            <div className='flex flex-col p-4 h-full'>
              <div className='flex justify-between py-2'>
                <span className='text-lg font-semibold text-textblack'>
                  Income Breakdown
                </span>
                <span>
                  {' '}
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <PieChart dataConfig={incomeDataConfig} />{' '}
            </div>
          </Card>
        </div>

        <div className='lg:col-span-2 flex flex-col gap-4'>
          <Card className='lg:flex-2'>
            <div className='flex flex-col p-4 h-full'>
              <div className='flex justify-between py-4'>
                <span className='text-lg font-semibold text-textblack'>
                  Account Sub-modules
                </span>
                <button
                  onClick={() => navigate(`/accounts/sub-modules/overview`)}
                  className='p-2 text-xs border border-tableborder rounded-2xl'
                >
                  View All
                </button>
              </div>
              <AccountSubCard />
            </div>
          </Card>

          <Card label='Total Expenses' className='lg:flex-1'>
            <div className='flex flex-col p-4 h-full'>
              <div className='flex justify-between py-4'>
                <span className='text-lg font-semibold text-textblack'>
                  Expense Breakdown
                </span>
                <span>
                  {' '}
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <PieChart dataConfig={expenseDataConfig} />{' '}
            </div>
          </Card>
        </div>
      </div>
    </ContentLayout>
  )
}
export default Accounts
