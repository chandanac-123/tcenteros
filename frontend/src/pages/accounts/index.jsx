import ContentLayout from '@common/MasterLayout/ContentLayout'
import MonthlyFinanceChart from '@common/charts/MonthlyFinanceChart'
import { Card } from '@pages/components/ui/card'
import SummaryCard from './components/SummaryCard'
import RevenuePieChart from '@common/charts/RevenuePieChart'
import { Progress } from '@pages/components/ui/progress'
import FinancialProgressBar from './components/FinancialProgress'
import AccountSubCard from './components/AccountSubCard'

const Accounts = () => {
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

  const progresscolorPalette = [
    {
      label: 'Membership Revenue',
      bg: 'bg-primary_light',
      bglight: 'bg-memberprogress_light'
    },
    {
      label: 'Inventory Purchase',
      bg: 'bg-progress_yellow',
      bglight: 'bg-inventory_light'
    },
    {
      label: 'Operational Expense',
      bg: 'bg-delete_red',
      bglight: 'bg-purchase_light'
    },
    {
      label: 'Other Revenue',
      bg: 'bg-barchartexpense',
      bglight: 'bg-plan_purple'
    }
  ]

  return (
    <ContentLayout>
      <div className='flex justify-between gap-4 overflow-auto'>
        <div className='flex flex-col w-3/5 gap-4'>
          <Card>
            <div className='flex flex-col p-2'>
              <span className='text-lg font-semibold text-textblack'>
                Account Overview
              </span>

              <div className='flex gap-4 flex-wrap'>
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
                <span>filter</span>
              </div>
              <MonthlyFinanceChart />
            </div>
          </Card>

          <Card>
            <div className='flex flex-col p-2'>
              <div className='flex justify-between py-4'>
                <span className='text-lg font-semibold text-textblack'>
                  Revenue Breakdown
                </span>
                <span>filter</span>
              </div>
              <RevenuePieChart />{' '}
            </div>
          </Card>
        </div>

        <div className='flex flex-col w-2/5 gap-4 '>
          <Card>
            <div className='flex flex-col p-2'>
              <div className='flex justify-between py-2'>
                <span className='text-lg font-semibold text-textblack'>
                  Account Sub-modules
                </span>
                <button className='p-2 text-xs border border-tableborder rounded-2xl'>
                  View All
                </button>
              </div>
              <AccountSubCard />
            </div>
          </Card>

          {/* <Card label='Total Expenses'>
            <div className='flex flex-col p-2'>
              <span className='text-lg font-semibold text-textblack'>
                End to End Financial Flows
              </span>
              <FinancialProgressBar />
            </div>
          </Card> */}
        </div>
      </div>
    </ContentLayout>
  )
}
export default Accounts
