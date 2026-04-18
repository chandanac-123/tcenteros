import { CircleDollarSign } from 'lucide-react'
import React from 'react'
import RevenueCards from './components/RevenueCards'
import LineChart from '@common/charts/LineChart'
import DoughnutChart from '@common/charts/DoughnutChart'
import LineBarChart from './components/LineBarChart'

const SASRevenue = () => {
  const datasets = [
    {
      label: "Revenue",
      data: [10, 100, 150, 50, 150, 40, 280, 40, 160, 410, 80, 210],
      borderColor: "#03881B",
      backgroundColor: "#03881B"
    },

  ]

  const doughnutData = [
    { label: "Subscription", value: 44, color: "#344BFD", amount: 1411 },
    { label: "Subscription Renewal ", value: 28, color: "#FFD200", amount: 12323 },
    { label: "Via Partners", value: 12, color: "#F68D2B", amount: 23211 },
    { label: "Branch Purchase", value: 10, color: "#8B24E2", amount: 54221 },
    { label: "Network Commission", value: 6, color: "#F4A79D", amount: 54221 }

  ]
  const values = doughnutData.map(item => item.value);
  const labels = doughnutData.map(item => item.label);
  const colors = doughnutData.map(item => item.color);
  return (
    <div>
      <div className="flex items-center gap-4 p-4">
        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
          <CircleDollarSign size={30} className="text-onboard_primary" />
        </div>
        <div className="flex flex-col justify-center gap-3">
          <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
            Revenue & Billing
          </h1>
          <p className="text-[#393636] font-inter text-[14px] font-medium">
            Track SaaS revenue and partner commissions
          </p>
        </div>
      </div>

      <div className="p-4">
        <RevenueCards />
      </div>


      <div className="px-4">
        <div className="px-4 py-5 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-lg">
          <h2 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold pb-3">Monthly Recurring Revenue Trend</h2>
          <LineChart
            datasets={datasets}
            yMin={0}
            yMax={500}
            tickFormat={(val) => `₹${val}`}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="w-full  flex items-stretch justify-betwwen gap-5 shadow-[0px_5px_15px_rgba(0,0,0,0.35)] rounded-lg p-8">
          <div className="w-[40%] flex  items-center justify-center  p-5 rounded-lg">
            <div className="w-[50%]">
              <DoughnutChart
                values={values}
                labels={labels}
                colors={colors}
                cutout="80%"
              />

            </div>
          </div>

          <div className="w-[70%] p-5 rounded-lg flex items-center justify-center">
            <LineBarChart data={doughnutData} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SASRevenue
