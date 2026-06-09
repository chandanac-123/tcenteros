import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { useState } from 'react'
import IncomeTable from './IncomeTable'
import ExpenseTable from './ExpenseTable'
import SettlementTable from './SettlementTable'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { downloadFile, formatDate } from '@utils/helper'
import {
  useGenerateConsolidatedExpensesReport,
  useGenerateConsolidatedIncomeReport,
  useGenerateConsolidatedSettlementsReport
} from '@api-queries/center-admin/report/Query'

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
    { id: 'expenses', name: 'Expenses' },
    { id: 'settlement', name: 'Settlement' }
  ]

  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  })

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
        date_to: tableParams?.date_to
          ? formatDate(tableParams.date_to)
          : null,
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
      {/* Header */}
      <h1 className="text-lg sm:text-xl font-semibold text-textblack mb-4">
        Reports -
        <span className="ml-1">
          {activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1)}
        </span>
      </h1>

      {/* Tabs + Filters */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
        {/* Tabs */}
        <div className="w-full lg:w-auto overflow-x-auto">
          <CustomeTab
            tabList={employeeOrMember}
            defaultVal="income"
            tabsListClass="p-[1px] w-full sm:w-[400px]"
            onChange={value => changeReportType(value)}
          />
        </div>

        {/* Date Filter */}
        <div className="w-full lg:w-auto flex justify-start lg:justify-end">
          <div className="w-full sm:w-[320px]">
            <CustomDatePicker
              pickerType="range"
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
        </div>
      </div>

      {/* Tables */}
      <div className="w-full overflow-hidden">
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
      </div>
    </ContentLayout>
  )
}

export default Reports