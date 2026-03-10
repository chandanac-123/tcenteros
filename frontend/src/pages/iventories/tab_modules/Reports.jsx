import React, { useState } from 'react'
import CustomDatePicker from '@common/CustomeDatepicker'
import StockReport from '../components/reports/StockReport'
import SalesReport from '../components/reports/SalesReport'
import { Download } from 'lucide-react'

const Reports = () => {
  const [reportType, setReportType] = useState('sales')

  return (
    <div className="flex flex-col gap-4">

      {/* TITLE */}
      <h1 className="text-lg font-semibold">Reports</h1>

      {/* REPORT TYPE */}
      <div className="flex gap-6 justify-around flex-wrap border border-gray-300 p-4 rounded-lg">

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="reportType"
            value="sales"
            checked={reportType === "sales"}
            onChange={() => setReportType("sales")}
            className="accent-blue-600"
          />
          <span>Sales Report</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="reportType"
            value="purchase"
            checked={reportType === "purchase"}
            onChange={() => setReportType("purchase")}
            className="accent-blue-600"
          />
          <span>Purchase Report</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="reportType"
            value="inventory"
            checked={reportType === "inventory"}
            onChange={() => setReportType("inventory")}
            className="accent-blue-600"
          />
          <span>Inventory Report</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="reportType"
            value="stock"
            checked={reportType === "stock"}
            onChange={() => setReportType("stock")}
            className="accent-blue-600"
          />
          <span>Stock Movement</span>
        </label>

        
      </div>

      {/* FILTER SECTION */}
      <div className="flex flex-wrap w-1/2  gap-4 items-end border border-gray-300 p-4 rounded-lg">

        <div className="flex flex-auto">
          <CustomDatePicker label="Start Date"
           pickerType='range' />
        </div>

        <button className="bg-[#E2EBFF] text-[#1452D4] border-2 font-medium border-[#1452D4] px-4 py-1 rounded-md">
          Generate Report
        </button>

        {/* <button className="bg-[#F0DEFF] flex items-center gap-2 text-[#8B24E2] border-2 font-medium border-[#8A00FF] px-4 py-1 rounded-md">
          Download <Download size={16}/>
        </button> */}

      </div>

      {/* TABLE SECTION */}
      <div className="border border-gray-300 rounded-lg p-4">

        {reportType === "sales" && <SalesReport />}

        {reportType === "stock" && <StockReport />}

        {/* future reports */}
        {reportType === "purchase" && <StockReport />}
        {reportType === "inventory" && <StockReport />}

      </div>

    </div>
  )
}

export default Reports