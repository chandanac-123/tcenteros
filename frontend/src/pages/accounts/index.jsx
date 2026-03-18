import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Card } from '@pages/components/ui/card'
import SummaryCard from './components/SummaryCard'
import AccountSubCard from './components/AccountSubCard'
import { useNavigate } from 'react-router-dom'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import BarChart from '@common/charts/BarChart'
import PieChart from '@common/charts/PieChart'
import { useAccountsOverviewQuery } from '@api-queries/accounts/Query'
import { useDashboardQuery } from '@api-queries/Dashboard/Query'

const Accounts = () => {
  // const { data, isLoading, isError } = useAccountsOverviewQuery()
  const { data, isLoading, error } = useDashboardQuery()

  const revenueLabels = data?.revenue_trend?.map(i => i.month) || []
  const incomeData = data?.revenue_trend?.map(i => i.income) || []

  const expenseData = data?.revenue_trend?.map(i => i.expense) || []

  const navigate = useNavigate()
  const summaryData = [
    { title: 'Total Income', amount: 3000 },
    { title: 'Total Expense', amount: 1200 },
    { title: 'Net Profit', amount: 1800 },
    { title: 'Pending Payment', amount: 500 }
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
    { key: 'membership', label: 'Membership ', value: 5000, color: '#8A00FF' },
    { key: 'networking', label: 'Networking ', value: 3000, color: '#EB4824' },
    {
      key: 'inventory',
      label: 'Inventory Sales',
      value: 2000,
      color: '#FFCD0F'
    },
    { key: 'other', label: 'Other Income', value: 1000, color: '#A3AED0' }
  ]
  const expenseDataConfig = [
    { key: 'networking', label: 'Salary', value: 4000, color: '#3B82F6' },
    { key: 'branching', label: 'Branching', value: 2000, color: '#EF4444' },
    { key: 'salary', label: 'Salary ', value: 1500, color: '#F59E0B' },
    {
      key: 'inventory',
      label: 'Inventory Purchase',
      value: 1500,
      color: '#F59E0B'
    },
    { key: 'other', label: 'Other ', value: 1000, color: '#10B981' }
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
          <Card className='lg:flex-1'>
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
