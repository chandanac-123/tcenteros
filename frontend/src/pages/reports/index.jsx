import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { useState } from 'react'
import IncomeTable from './IncomeTable'
import ExpenseTable from './ExpenseTable'
import SettlementTable from './SettlementTable'
import { Download } from 'lucide-react'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { downloadFile, formatDate } from '@utils/helper'
import {
  useGenerateConsolidatedExpensesReport,
  useGenerateConsolidatedIncomeReport,
  useGenerateConsolidatedSettlementsReport
} from '@api-queries/report/Query'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('income')
  const { mutateAsync: generateIncomeReport } =
    useGenerateConsolidatedIncomeReport()
  const { mutateAsync: generateExpensesReport } =
    useGenerateConsolidatedExpensesReport()
  const { mutateAsync: generateSettlementsReport } =
    useGenerateConsolidatedSettlementsReport()

  const employeeOrMember = [
    { id: 'income', name: 'Income' },
    { id: 'expenses', name: 'Expenses ' },
    { id: 'settlement', name: 'Settlement' }
  ]
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tableParams, setTableParams] = useState({
    page: 1,
    date_from: null,
    date_to: null
  })

  const handleDownload = async format => {
    try {
      const payload = {
        date_from: tableParams?.date_from
          ? formatDate(tableParams.date_from)
          : null,
        date_to: tableParams?.date_to ? formatDate(tableParams.date_to) : null,
        format
      }
      let response
      let filename
      switch (activeTab) {
        case 'income':
          response = await generateIncomeReport(payload)
          filename = `income-report.${format}`
          break

        case 'expenses':
          response = await generateExpensesReport(payload)
          filename = `expenses-report.${format}`
          break

        case 'settlement':
          response = await generateSettlementsReport(payload)
          filename = `settlement-report.${format}`
          break
        default:
          return
      }
      downloadFile(response, filename)
    } catch (error) {
      console.error(error)
    }
  }

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
        Reports -<>{activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1)}</>
      </h1>
      <div className='flex justify-between items-center mb-4 gap-3'>
        {/* Tabs */}
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='income'
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
      {activeTab === 'income' && (
        <IncomeTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
      {activeTab === 'expenses' && (
        <ExpenseTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
      {activeTab === 'settlement' && (
        <SettlementTable
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      )}
    </ContentLayout>
  )
}

export default Reports
