import ContentLayout from '@common/MasterLayout/ContentLayout'
import LineChart from '@common/charts/LineChart'
import SubCard from './components/Cards'
import { Card } from '@pages/components/ui/card'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import BarChart from '@common/charts/BarChart'
import BranchDetailsButton from '@pages/branch/BranchDetailsButton'
import { useDashboardQuery } from '@api-queries/Dashboard/Query'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { useGetBranchCountQuery } from '@api-queries/branch/Query'

const Dashboard = () => {
  const [greeting, setGreeting] = useState('')
  const navigate = useNavigate()
  const setFirstLogin = useAuthStore(state => state.setFirstLogin)
  const { data: branchCountData } = useGetBranchCountQuery()
  console.log('branchCountData: ', branchCountData);

  const isLimitReached =
  branchCountData &&
  branchCountData.created_subcenters ===
    branchCountData.branches_purchased

  useEffect(() => {
    setFirstLogin(false)
  }, [])

  const { data, isLoading, error } = useDashboardQuery()
  const cardsData = [
    {
      label: 'Total Employees',
      value: data?.total_employees || 0,
      onClick: () => navigate('/employee-management')
    },
    {
      label: 'Total Members',
      value: data?.total_members || 0,
      onClick: () => navigate('/crm')
    },
    {
      label: 'Active Memberships',
      value: data?.active_memberships || 0,
      onClick: () => navigate('/membership-plan?tab=active')
    },
    { label: 'Active Leads', value: 0, onClick: () => navigate('/crm?tab=leads') },
    {
      label: 'Total Guests',
      value: data?.total_guests || 0,
      onClick: () => navigate('/crm?tab=guests')
    },
    {
      label: 'Today Attendance',
      value: data?.today_attendance || 0,
      onClick: () => navigate('/attendance')
    },
    {
      label: 'Total Revenue',
      value: data?.total_revenue || 0,
      onClick: () => navigate('/accounts')
    },
    {
      label: 'Total Expense',
      value: data?.total_expenses || 0,
      onClick: () => navigate('/accounts')
    },
    {
      label: 'Net Profit',
      value: data?.net_profit || 0,
      onClick: () => navigate('/accounts')
    }
  ]

  const revenueLabels = data?.revenue_trend?.map(i => i.month) || []

  const incomeData = data?.revenue_trend?.map(i => i.income) || []

  const expenseData = data?.revenue_trend?.map(i => i.expense) || []
  const attendanceLabels = data?.attendance_chart?.map(i => i.month) || []

  const attendanceData =
    data?.attendance_chart?.map(i => i.attendance_percentage) || []

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning 🌞🌻')
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon 🌤️😎')
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening 🌇💫')
      } else {
        setGreeting('Good Night 🌙⭐')
      }
    }
    updateGreeting() // initial call
    const interval = setInterval(updateGreeting, 100000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ContentLayout>
      <div className='gap-4 flex flex-col w-full'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex flex-col'>
            <span>{greeting}</span>
            <span className='text-xs'>{data?.centeradmin_name}</span>
          </div>
          <div>
            {' '}
            
            <BranchDetailsButton isLimitReached={isLimitReached} />
          </div>
        </div>

        <div className='grid gap-4   grid-cols-[repeat(auto-fit,minmax(220px,1fr))]'>
          {cardsData.map((item, index) => (
            <SubCard
              key={index}
              label={item.label}
              value={item.value}
              index={index}
              onClick={item.onClick}
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
