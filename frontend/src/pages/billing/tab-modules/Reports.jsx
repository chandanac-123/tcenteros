import React, { useState } from 'react'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import { Download } from 'lucide-react'
import { downloadFile, formatDate } from '@utils/helper'
import RadioGroup from '@common/components/RadioGroup'
import NetworkEarningReport from '../component/reports/NetworkEarningReport'
import MembershipRevenueReport from '../component/reports/MembershipRevenueReport'
import InventorySaleReport from '../component/reports/InventorySaleReport'
import TaxSummaryReport from '../component/reports/TaxSummaryReport'
import SalesReport from '../component/reports/SalesReport'
import {
  useInventorySaleReportQuery,
  useMembershipRevenueReportQuery,
  useNetworkEarningReportQuery,
  useSaleReportQuery,
  useTaxSummaryReportQuery
} from '@api-queries/billing/Query'
import { useGenerateSaleReportMutation } from '@api-queries/billing/Query'

const BillingReports = () => {
  const [reportType, setReportType] = useState('sales')
  const { mutateAsync: generateSalesReport } = useGenerateSaleReportMutation()
  const { mutateAsync: generateMembershipRevenueReport } =
    useMembershipRevenueReportQuery()
  const { mutateAsync: generateNetworkEarningReport } =
    useNetworkEarningReportQuery()
  const { mutateAsync: generateTaxSummaryReport } = useTaxSummaryReportQuery()
  const { mutateAsync: generateInventorySaleReport } =
    useInventorySaleReportQuery()

  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tableParams, setTableParams] = useState({
    page: 1,
    date_from: null,
    date_to: null
  })

 const handleDownload = async (format) => {
  try {
    const payload = {
      date_from: tableParams?.date_from || null,
      date_to: tableParams?.date_to || null,
      format
    }

    let response
    let filename

    switch (reportType) {
      case 'sales':
        response = await generateSalesReport(payload)
        filename = `daily-sales-report.${format}`
        break

      case 'inventory':
        response = await generateInventorySaleReport(payload)
        filename = `inventory-sale-report.${format}`
        break

      case 'membership':
        response = await generateMembershipRevenueReport(payload)
        filename = `membership-revenue-report.${format}`
        break

      case 'network':
        response = await generateNetworkEarningReport(payload)
        filename = `network-earning-report.${format}`
        break

      case 'tax':
        response = await generateTaxSummaryReport(payload)
        filename = `tax-summary-report.${format}`
        break

      default:
        return
    }

    downloadFile(response, filename)

  } catch (error) {
    console.error('Download failed:', error)
  }
}

  const changeReportType = type => {
    setReportType(type)
    setDateRange({ from: null, to: null })
    setTableParams({
      page: 1,
      date_from: null,
      date_to: null
    })
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* TITLE */}
      <h1 className='text-lg font-semibold'>Reports</h1>

      {/* REPORT TYPE */}
      <div className='flex gap-6 justify-around flex-wrap border border-gray-300 p-4 rounded-lg'>
        <RadioGroup
          name='reportType'
          options={[
            { value: 'sales', label: 'Daily Sales' },
            { value: 'inventory', label: 'Inventory Sale' },
            { value: 'membership', label: 'Membership Revenue' },
            { value: 'network', label: 'Network Earning' },
            { value: 'tax', label: 'Tax Summary' }
          ]}
          value={reportType}
          checked={reportType}
          onChange={changeReportType}
          className='flex gap-3'
        />
        <div className='flex flex-auto'>
          <CustomDatePicker
            label='Start and End Date'
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
      </div>

      <div className='flex flex-wrap gap-4 justify-end'>
        <button
          onClick={() => handleDownload('csv')}
          className='bg-[#E2EBFF] text-[#1452D4] border-2 font-medium border-[#1452D4] px-4 py-1 rounded-md'
        >
          Generate CSV
        </button>
        <button
          onClick={() => handleDownload('pdf')}
          className='bg-[#F0DEFF] flex items-center gap-2 text-[#8B24E2] border-2 font-medium border-[#8A00FF] px-4 py-1 rounded-md'
        >
          Download <Download size={16} />
        </button>
      </div>

      {/* TABLE SECTION */}
      <div>
        {reportType === 'sales' && (
          <SalesReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'network' && (
          <NetworkEarningReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'membership' && (
          <MembershipRevenueReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'inventory' && (
          <InventorySaleReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'tax' && (
          <TaxSummaryReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
      </div>
    </div>
  )
}

export default BillingReports
