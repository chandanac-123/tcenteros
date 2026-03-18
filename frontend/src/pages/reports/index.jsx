import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { useState } from 'react'
import IncomeTable from './IncomeTable'
import ExpenseTable from './ExpenseTable'
import SettlementTable from './SettlementTable'
import { Download } from 'lucide-react'
import CustomDatePicker from '@common/components/CustomeDatepicker'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Income')
  const employeeOrMember = [
    { id: 1, name: 'Income' },
    { id: 2, name: 'Expenses '},
    { id: 3, name: 'Settlement' }
  ]
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tableParams, setTableParams] = useState({
    page: 1,
    date_from: null,
    date_to: null
  })

  const changeReportType = type => {
    setActiveTab(type)
    setDateRange({ from: null, to: null })
    setTableParams({
      page: 1,
      date_from: null,
      date_to: null
    })
  }
  return (
    <ContentLayout>
      <h1 className='text-xl font-semibold text-textblack mb-4'>
        Reports - {activeTab}
      </h1>
      <div className='flex justify-between items-center mb-4 gap-3'>
        {/* Tabs */}
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='Income'
          tabsListClass='p-[1px] w-[400px] '
          onChange={value => changeReportType(value)}
        />

        {/* Filters + Buttons */}
        <div className='flex w-full items-center gap-2 justify-end'>
          <div className='w-80'>
            <CustomDatePicker
              pickerType='range'
              value={dateRange}
              onChange={range => {
                setDateRange(range)
                setTableParams(prev => ({
                  ...prev,
                  page: 1,
                  date_from: formatDate(range?.from),
                  date_to: formatDate(range?.to)
                }))
              }}
            />
          </div>
          {/* <button
            onClick={() => handleDownload('csv')}
            className='bg-[#E2EBFF] text-[#1452D4] border border-[#1452D4] px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap'
          >
            Generate CSV
          </button>

          <button
            onClick={() => handleDownload('pdf')}
            className='bg-[#F0DEFF] flex items-center gap-2 text-[#8B24E2] border border-[#8A00FF] px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap'
          >
            Download <Download size={16} />
          </button> */}
        </div>
      </div>
      {/* Render table based on activeTab */}
      {activeTab === 'Income' && (
        <IncomeTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
      {activeTab === 'Expenses ' && (
        <ExpenseTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
      {activeTab === 'Settlement' && (
        <SettlementTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
    </ContentLayout>
  )
}

export default Reports
