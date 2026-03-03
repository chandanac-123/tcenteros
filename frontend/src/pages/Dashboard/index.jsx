import ContentLayout from '@common/masterLayout/ContentLayout'
import LineChart from '@common/charts/LineChart'
import SubCard from './components/Cards'
import { Card } from '@pages/components/ui/card'
import CustomDatePicker from '@common/CustomeDatepicker'
import BarChart from '@common/charts/BarChart'
import DashboardTable from './components/DashboardTable'
import BranchDetailsButton from '@pages/branch/BranchDetailsButton'

const cardsData = [
  { label: 'Total employees', value: 354 },
  { label: 'Total Members', value: 298 },
  { label: 'Active Memberships', value: 56 },
  { label: 'Active Leads', value: 12 },
  { label: 'Total Guests', value: 87 },
  { label: 'Today Attendance', value: 14 },
  { label: 'Total Revenue', value: 23 },
  { label: 'Total Expense', value: 5 },
  { label: 'Pending Dues', value: 5 }
]

const Dashboard = () => {
  return (
    <ContentLayout>
      <div className='gap-4 flex flex-col w-full'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex flex-col'>
            <span>Good Morning!</span>
            <span className='text-xs'>Center Admin</span>
          </div>
          <div> <BranchDetailsButton /></div>
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
            <Card className='p-4 h-full'>
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
              <BarChart variant='dashboard' />
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
              datasets={[
                {
                  label: 'Morning',
                  data: [20, 10, 90, 60, 30],
                  borderColor: '#3B82F6'
                },
                {
                  label: 'Afternoon',
                  data: [55, 58, 60, 62, 59],
                  borderColor: '#FACC15'
                },
                {
                  label: 'Evening',
                  data: [10, 8, 25, 18, 22],
                  borderColor: '#55EFC2'
                }
              ]}
              yMin={0}
              yMax={100}
              tickFormat={v => v + '%'}
            />
          </Card>
        </div>
        <DashboardTable />
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
