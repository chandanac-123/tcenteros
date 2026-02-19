import ContentLayout from '@common/MasterLayout/ContentLayout'
import MonthlyFinanceChart from '@common/charts/MonthlyFinanceChart'
import { Card } from '@pages/components/ui/card'
import SummaryCard from './components/SummaryCard'
import RevenuePieChart from '@common/charts/RevenuePieChart'
import FinancialProgressBar from './components/FinancialProgress'
import AccountSubCard from './components/AccountSubCard'
import { DataTable } from '@common/DataTable'
import { useNavigate } from 'react-router-dom'
import CustomDatePicker from '@common/CustomeDatepicker'

const Accounts = () => {
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

  const progresscolorPalette = [
    {
      label: 'Membership Sale',
      bg: 'bg-primary_light',
      bglight: 'bg-memberprogress_light'
    },
    {
      label: 'Inventory Sale',
      bg: 'bg-progress_yellow',
      bglight: 'bg-inventory_light'
    },
    {
      label: 'Inventory Purchase',
      bg: 'bg-purchase',
      bglight: 'bg-purchase_light'
    },
    {
      label: 'Payroll Processing',
      bg: 'bg-barchartexpense',
      bglight: 'bg-payroll_light'
    },
    {
      label: 'Trainer Charges',
      bg: 'bg-green_text',
      bglight: 'bg-progress_light_green'
    },
    {
      label: 'Network Settlements',
      bg: 'bg-Network',
      bglight: 'bg-Network_light'
    },
    {
      label: 'General Expenses',
      bg: 'bg-progress_blue',
      bglight: 'bg-general_bg'
    }
  ]

  const columns = [
    {
      accessorKey: 'full_name',
      header: 'Center Name'
    },
    {
      accessorKey: 'designation_name',
      header: 'Transaction Date'
    },
    {
      accessorKey: 'email',
      header: 'Description'
    },
    {
      accessorKey: 'mobile',
      header: 'Debit'
    },
    {
      accessorKey: 'center_name',
      header: 'Credit'
    },
    {
      accessorKey: 'joining_date',
      header: 'Payroll Date'
    },
    {
      accessorKey: 'joining_date',
      header: 'Action'
    }
  ]

  return (
    <ContentLayout>
      <div className='flex flex-col lg:flex-row gap-4 items-stretch lg:min-h-[88vh] '>
        <div className='flex flex-col w-full lg:w-3/5 gap-4'>
          <Card className='lg:flex-1'>
            <div className='flex flex-col p-4 h-full'>
              <span className='text-lg font-semibold text-textblack'>
                Account Overview
              </span>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4'>
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
                <CustomDatePicker pickerType="year"/>
                </span>
              </div>
              <MonthlyFinanceChart />
            </div>
          </Card>

          <Card className='lg:flex-1'>
            <div className='flex flex-col p-4 h-full'>
              <div className='flex justify-between py-2'>
                <span className='text-lg font-semibold text-textblack'>
                  Revenue Breakdown
                </span>
                <span> <CustomDatePicker pickerType="year"/></span>
              </div>
              <RevenuePieChart />{' '}
            </div>
          </Card>
        </div>

        <div className='flex flex-col w-full lg:w-2/5 gap-4'>
          <Card className='lg:flex-1'>
            <div className='flex flex-col p-4 h-full'>
              <div className='flex justify-between py-2'>
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
              <span className='text-lg font-semibold text-textblack'>
                End to End Financial Flows
              </span>

              {progresscolorPalette.map((item, index) => (
                <div key={index} className='flex flex-col gap-2 my-2 w-full'>
                  <div className='flex justify-between items-center w-full'>
                    <FinancialProgressBar
                      label={item.label}
                      value=''
                      progressBg={item.bg}
                      progressBgLight={item.bglight}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className='my-4'>
        <DataTable
          title='Products'
          subTitle='Products'
          columns={columns}
          data={[]}
        />
      </div>
    </ContentLayout>
  )
}
export default Accounts
