import React, { useState } from 'react'
import CustomDatePicker from '@common/components/CustomeDatepicker'
import SalesReport from '../components/reports/SalesReport'
import { Download } from 'lucide-react'
import StockMovementReport from '../components/reports/StockMovementReport'
import PurchaseReport from '../components/reports/PurchaseReport'
import InventoryReport from '../components/reports/InventoryReport'
import { downloadFile, formatDate } from '@utils/helper'
import {
  useGenerateSaleReportMutation,
  useGenerateStockReportMutation,
  useGenerateInventoryReportMutation,
  useGeneratePurchaseReportMutation
} from '@api-queries/center-admin/inventory/Query'
import RadioGroup from '@common/components/RadioGroup'

const Reports = () => {
  const [reportType, setReportType] = useState('sales')
  const { mutateAsync: generateSalesReport } = useGenerateSaleReportMutation()
  const { mutateAsync: generatePurchaseReport } =
    useGeneratePurchaseReportMutation()
  const { mutateAsync: generateInventoryReport } =
    useGenerateInventoryReportMutation()
  const { mutateAsync: generateStockReport } = useGenerateStockReportMutation()
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
      switch (reportType) {
        case 'sales':
          response = await generateSalesReport(payload)
          filename = `sales-report.${format}`
          break

        case 'purchase':
          response = await generatePurchaseReport(payload)
          filename = `purchase-report.${format}`
          break

        case 'product':
          response = await generateInventoryReport(payload)
          filename = `product-report.${format}`
          break

        case 'stock':
          response = await generateStockReport(payload)
          filename = `stock-report.${format}`
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
            { value: 'sales', label: 'Sales Report' },
            { value: 'purchase', label: 'Purchase Report' },
            { value: 'product', label: 'Product Report' },
            { value: 'stock', label: 'Stock Movement' }
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
        {reportType === 'stock' && (
          <StockMovementReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'purchase' && (
          <PurchaseReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
        {reportType === 'product' && (
          <InventoryReport
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        )}
      </div>
    </div>
  )
}

export default Reports
