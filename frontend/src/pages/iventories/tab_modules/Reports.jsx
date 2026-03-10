import React, { useState } from 'react'
import CustomDatePicker from '@common/CustomeDatepicker'
import SalesReport from '../components/reports/SalesReport'
import { Download } from 'lucide-react'
import StockMovementReport from '../components/reports/StockMovementReport'
import PurchaseReport from '../components/reports/PurchaseReport'
import InventoryReport from '../components/reports/InventoryReport'
import { downloadFile, formatDate } from '@utils/helper'
import { useGenerateSaleReportMutation } from '@api-queries/inventory/Query'

const Reports = () => {
  const [reportType, setReportType] = useState('sales')
  const { mutateAsync: generateSalesReport } = useGenerateSaleReportMutation()
  const [dateRange, setDateRange] = useState({ from: null, to: null })
  const [tableParams, setTableParams] = useState({
    page: 1,
    date_from: null,
    date_to: null
  })

  const handleDownload = async format => {
    try {
      const response = await generateSalesReport({
        date_from: formatDate(dateRange?.from),
        date_to: formatDate(dateRange?.to),
        format
      })

      const filename =
        format === 'csv' ? 'sales-report.csv' : 'sales-report.pdf'

      downloadFile(response, filename)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <div className='flex flex-col gap-4'>
      {/* TITLE */}
      <h1 className='text-lg font-semibold'>Reports</h1>

      {/* REPORT TYPE */}
      <div className='flex gap-6 justify-around flex-wrap border border-gray-300 p-4 rounded-lg'>
        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='radio'
            name='reportType'
            value='sales'
            checked={reportType === 'sales'}
            onChange={() => setReportType('sales')}
            className='accent-blue-600'
          />
          <span>Sales Report</span>
        </label>

        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='radio'
            name='reportType'
            value='purchase'
            checked={reportType === 'purchase'}
            onChange={() => setReportType('purchase')}
            className='accent-blue-600'
          />
          <span>Purchase Report</span>
        </label>

        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='radio'
            name='reportType'
            value='inventory'
            checked={reportType === 'inventory'}
            onChange={() => setReportType('inventory')}
            className='accent-blue-600'
          />
          <span>Inventory Report</span>
        </label>

        <label className='flex items-center gap-2 cursor-pointer'>
          <input
            type='radio'
            name='reportType'
            value='stock'
            checked={reportType === 'stock'}
            onChange={() => setReportType('stock')}
            className='accent-blue-600'
          />
          <span>Stock Movement</span>
        </label>
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

      {/* FILTER SECTION */}
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
        {reportType === 'inventory' && <InventoryReport />}
      </div>
    </div>
  )
}

export default Reports
