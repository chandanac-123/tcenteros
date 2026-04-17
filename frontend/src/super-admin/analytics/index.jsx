import ContentLayout from "@common/MasterLayout/ContentLayout"
import { Calendar, CalendarDays, ChartPie, Handshake, Network, Split } from "lucide-react"
import AnalyticsCards from "./components/AnalyticsCards"
import LineChart from "@common/charts/LineChart"
import BarChart from "@common/charts/BarChart"
import CustomDatePicker from "@common/components/CustomeDatepicker"
import MultiRingChart from "@common/charts/MultiRingChart"
import ChurmAnalyticsCard from "./components/ChurmAnalyticsCard"

const Analytics = () => {
  const datasets = [
    {
      label: "Revenue",
      data: [120, 200, 150, 10, 250, 400, 380, 420, 460, 500, 480, 510],
      borderColor: "#03881B",
      backgroundColor: "#03881B"
    },
    {
      label: "Commission",
      data: [80, 140, 100, 220, 181, 300, 290, 10, 350, 390, 370, 420],
      borderColor: "#000000",
      backgroundColor: "#000000"
    }
  ]

  const barLabels = ["Direct Sales", "Partner Sales"]

  const barChartData = [
    {
      label: "",
      data: [3200, 800],
      backgroundColor: ["#03881B", "#555555"]
    }
  ]

  const multiRingData = [
    {
      label: "Monthly Subscription",
      value: 75,
      color: "#34D399"
    },
    {
      label: "Inactive Members",
      value: 25,
      color: "#CC8ACF"
    },
    {
      label: "New Signups",
      value: 60,
      color: "#38B6DE"
    },
    {
      label: "Renewals",
      value: 45,
      color: "#8C64F6"
    },
    {
      label: "Churn Rate",
      value: 15,
      color: "#F8B286"
    }
  ];
  return (
    <ContentLayout>
      <div className="flex flex-col gap-8 pb-5">

        <div className="flex items-center  ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <ChartPie size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Analytics
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Platform insights and performance metrics
              </p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <div className=" rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <AnalyticsCards />
            <div className="px-4 py-5">
              <h2 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold ">Membership Growth Trend</h2>
              <LineChart
                datasets={datasets}
                yMin={0}
                yMax={500}
                tickFormat={(val) => `₹${val}`}
              />
            </div>
          </div>
        </div>


        <div className="px-4 ">
          <div className="p-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between pe-10">
              <h2 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold py-4 ">Average Sales by source</h2>
              <span>
                <CustomDatePicker pickerType="year" />
              </span>
            </div>
            <BarChart
              labels={barLabels}
              datasets={barChartData}
              barThickness={250}
            />
          </div>
        </div>

        <div className="px-4">
          <div className="p-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)] flex items-center w-full ">
            <div className="w-[40%]">
              <MultiRingChart dataConfig={multiRingData} display={false} />
            </div>
            <div className="flex flex-col gap-2 w-[60%] ">

              <div className="w-full  bg-white rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] p-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0px_1.3px_5.8px_rgba(0,0,0,0.13)]">
                    <CalendarDays color="#1452D4" />
                  </div>

                  {/* Title */}
                  <p className="text-[#3A3A3A] text-sm sm:text-base font-semibold font-inter">
                    Monthly Subscription
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-8">

                  {/* Percentage */}
                  <span className="text-black text-sm sm:text-base font-semibold font-inter">
                    62%
                  </span>

                  {/* Status Indicator */}
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#34D399]" />
                </div>
              </div>

              <div className="w-full  bg-white rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] p-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0px_1.3px_5.8px_rgba(0,0,0,0.13)]">
                    <Calendar color="#1452D4" />
                  </div>

                  {/* Title */}
                  <p className="text-[#3A3A3A] text-sm sm:text-base font-semibold font-inter">
                    Yearly Subscription
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-8">

                  {/* Percentage */}
                  <span className="text-black text-sm sm:text-base font-semibold font-inter">
                    26 %
                  </span>

                  {/* Status Indicator */}
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#CC8ACF]" />
                </div>
              </div>

              <div className="w-full  bg-white rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] p-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0px_1.3px_5.8px_rgba(0,0,0,0.13)]">
                    <Handshake color="#1452D4" />
                  </div>

                  {/* Title */}
                  <p className="text-[#3A3A3A] text-sm sm:text-base font-semibold font-inter">
                    Via Partners
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-8">

                  {/* Percentage */}
                  <span className="text-black text-sm sm:text-base font-semibold font-inter">
                    12 %
                  </span>

                  {/* Status Indicator */}
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#38B6DE]" />
                </div>
              </div>

              <div className="w-full  bg-white rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] p-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0px_1.3px_5.8px_rgba(0,0,0,0.13)]">
                    <Split color="#1452D4" />
                  </div>

                  {/* Title */}
                  <p className="text-[#3A3A3A] text-sm sm:text-base font-semibold font-inter">
                    Branching
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-8">

                  {/* Percentage */}
                  <span className="text-black text-sm sm:text-base font-semibold font-inter">
                    12 %
                  </span>

                  {/* Status Indicator */}
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#8C64F6]" />
                </div>
              </div>

              <div className="w-full  bg-white rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] p-4 flex items-center justify-between">

                {/* Left Section */}
                <div className="flex items-center gap-4">

                  {/* Icon */}
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-[0px_1.3px_5.8px_rgba(0,0,0,0.13)]">
                    <Network color="#1452D4" />
                  </div>

                  {/* Title */}
                  <p className="text-[#3A3A3A] text-sm sm:text-base font-semibold font-inter">
                    Network Subscription
                  </p>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-8">

                  {/* Percentage */}
                  <span className="text-black text-sm sm:text-base font-semibold font-inter">
                    12 %
                  </span>

                  {/* Status Indicator */}
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#F8B286]" />
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="px-4">
          <div className="p-4 rounded-lg shadow-[0px_5px_15px_rgba(0,0,0,0.35)] flex items-center w-full ">
            <div className="flex flex-col w-full">
              <h2 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold py-4 ">Churn Analysis</h2>
              <div className="w-full">
                <ChurmAnalyticsCard />
              </div>
            </div>

          </div>
        </div>


      </div>

    </ContentLayout>
  )
}

export default Analytics
