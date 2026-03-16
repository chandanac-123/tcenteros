import ContentLayout from '@common/masterLayout/ContentLayout'
import LineChart from '@common/charts/LineChart'
import SubCard from './components/Cards'
import { Card } from '@pages/components/ui/card'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import BarChart from '@common/charts/BarChart'
import DashboardTable from './components/DashboardTable'
import BranchDetailsButton from '@pages/branch/BranchDetailsButton'
import { useDashboardQuery } from '@api-queries/Dashboard/Query'

const Dashboard = () => {
  const { data, isLoading, error } = useDashboardQuery()
  console.log('data: ', data)
  const cardsData = [
    { label: 'Total Employees', value: data?.total_employees || 0 },
    { label: 'Total Members', value: data?.total_members || 0 },
    { label: 'Active Memberships', value: data?.active_memberships || 0 },
    { label: 'Active Leads', value: 12 },
    { label: 'Total Guests', value: data?.total_guests || 0 },
    { label: 'Today Attendance', value: data?.today_attendance || 0 },
    { label: 'Total Revenue', value: data?.total_revenue || 0 },
    { label: 'Total Expense', value: data?.total_expenses || 0 },
    { label: 'Net Profit', value: data?.net_profit || 0 }
  ]

  const revenueLabels = data?.revenue_trend?.map(i => i.month) || []

  const incomeData = data?.revenue_trend?.map(i => i.income) || []

  const expenseData = data?.revenue_trend?.map(i => i.expense) || []
  const attendanceLabels = data?.attendance_chart?.map(i => i.month) || []

  const attendanceData =
    data?.attendance_chart?.map(i => i.attendance_percentage) || []
  return (
    <ContentLayout>
      <div className='gap-4 flex flex-col w-full'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex flex-col'>
            <span>Good Morning!</span>
            <span className='text-xs'>Center Admin</span>
          </div>
          <div>
            {' '}
            <BranchDetailsButton />
          </div>
        </div>

        <div className='grid gap-4   grid-cols-[repeat(auto-fit,minmax(220px,1fr))]'>
          {cardsData.map((item, index) => (
            <SubCard
              key={index}
              label={item.label}
              value={item.value}
              index={index}
            />
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
          {/* Chart Section */}
          <div className='lg:col-span-2'>
            <Card className='p-4 h-full '>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                <span className='font-semibold text-base'>
                  Total Revenue Summary
                </span>
                <span>
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <LineChart
                datasets={[
                  {
                    label: 'New Leads',
                    data: [500, 200, 3000, 1500, 800, 1200],
                    borderColor: '#3B82F6'
                  },
                  {
                    label: 'Contacted Lead',
                    data: [1500, 1400, 1300, 1500, 1400, 1500],
                    borderColor: '#FACC15'
                  },
                  {
                    label: 'Converted Lead',
                    data: [300, 200, 250, 180, 220, 260],
                    borderColor: '#55EFC2'
                  }
                ]}
                yMin={0}
                yMax={10000}
                tickFormat={v => (v >= 1000 ? v / 1000 + 'k' : v)}
              />
            </Card>
          </div>

          <div className='lg:col-span-2'>
            <Card className='p-4 h-full'>
              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
                <span className='font-semibold text-base'>Revenue Trend</span>
                <span>
                  <CustomDatePicker pickerType='year' />
                </span>
              </div>
              <BarChart
              isDashboard={true}
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
            </Card>
          </div>
        </div>

        <div className='w-full col-span-full'>
          <Card className='p-4 h-full'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4'>
              <span className='font-semibold text-base'>Total Attendance</span>
              <span>
                <CustomDatePicker pickerType='year' />
              </span>
            </div>
            <LineChart
              labels={attendanceLabels}
              datasets={[
                {
                  label: 'Attendance %',
                  data: attendanceData,
                  borderColor: '#3B82F6'
                }
              ]}
              yMin={0}
              yMax={100}
              stepSize={20}
              tickFormat={v => v + '%'}
            />
          </Card>
        </div>
        {/* <DashboardTable /> */}
      </div>
    </ContentLayout>
  )
}

export default Dashboard

{
  /* <LineChart
  datasets={[
    { label: 'In Stock', data: [70,65,110,75,80], borderColor: '#3B82F6' },
    { label: 'Low Stock', data: [70,68,72,75,70], borderColor: '#FACC15' },
    { label: 'Out of Stock', data: [20,5,30,12,15], borderColor: '#55EFC2' }
  ]}
  yMin={0}
  yMax={200}
/> */
}
