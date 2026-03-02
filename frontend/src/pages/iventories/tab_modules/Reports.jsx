import React, { useState } from 'react'
import CustomDatePicker from '@common/CustomeDatepicker'
import StockReport from '../components/reports/StockReport'
import SalesReport from '../components/reports/SalesReport'
import { Download } from 'lucide-react';

const Reports = () => {
  const [reportType, setReportType] = useState("sales"); // default

  return (
    <div className="flex flex-col">
      <div className="w-full">
        <h1 className='p-2 text-lg'>Reports</h1>
      </div>

      <div className='w-full flex items-stretch gap-3'>

        {/* LEFT PANEL */}
        <div className="w-[25%] border border-gray-300 flex flex-col space-y-4 p-3 rounded-lg shadow-xl">

          <div className="px-2 flex flex-col gap-4">
            <h3>Report Type</h3>

            <div className="flex flex-col sm:flex-row gap-4">

              {/* SALES */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="sales"
                  checked={reportType === "sales"}
                  onChange={() => setReportType("sales")}
                  className="accent-blue-600"
                />
                <span className="text-md font-medium">Sales Report</span>
              </label>

              {/* STOCK */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  value="stock"
                  checked={reportType === "stock"}
                  onChange={() => setReportType("stock")}
                  className="accent-blue-600"
                />
                <span className="text-md font-medium">Stock Report</span>
              </label>

            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <p>Start Date</p>
            <CustomDatePicker />
          </div>

          <div className="flex flex-col space-y-1">
            <p>End Date</p>
            <CustomDatePicker />
          </div>

          <button className='bg-[#E2EBFF] text-[#1452D4] border-2 font-medium border-[#1452D4] py-1 rounded-md'>
            Generate Report
          </button>

          <button className='bg-[#F0DEFF] flex items-center justify-center gap-3 text-[#8B24E2] border-2 font-medium border-[#8A00FF] py-1 rounded-md'>
            Download <Download/>
          </button>

        </div>

        {/* RIGHT PANEL */}
        <div className="w-[75%]">

          {reportType === "sales" ? (
            <SalesReport />
          ) : (
            <StockReport />
          )}

        </div>
      </div>
    </div>
  )
}

export default Reports