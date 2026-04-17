import CustomDatePicker from "@common/components/CustomeDatepicker";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Calendar, Handshake } from "lucide-react";
import React from "react";
import CalenderCard from "../components/CalenderCard";

const calendarData = [
  { day: "01", renewals: 5, revenue: 34760 },
  { day: "02", renewals: 3, revenue: 18200 },
  { day: "03", renewals: 7, revenue: 42100 },
  { day: "04", renewals: 2, revenue: 9800 },
  { day: "05", renewals: 6, revenue: 27500 },
  { day: "06", renewals: 4, revenue: 19800 },
  { day: "07", renewals: 8, revenue: 46300 },
  { day: "08", renewals: 1, revenue: 7200 },
  { day: "09", renewals: 9, revenue: 50200 },
  { day: "10", renewals: 5, revenue: 31000 },
  { day: "11", renewals: 6, revenue: 28900 },
  { day: "12", renewals: 2, revenue: 11500 },
  { day: "13", renewals: 7, revenue: 39800 },
  { day: "14", renewals: 4, revenue: 21000 },
  { day: "15", renewals: 3, revenue: 17600 },
  { day: "16", renewals: 8, revenue: 45000 },
  { day: "17", renewals: 6, revenue: 33000 },
  { day: "18", renewals: 2, revenue: 12400 },
  { day: "19", renewals: 7, revenue: 40500 },
  { day: "20", renewals: 5, revenue: 29500 },
  { day: "21", renewals: 9, revenue: 52000 },
  { day: "22", renewals: 1, revenue: 8500 },
  { day: "23", renewals: 4, revenue: 22000 },
  { day: "24", renewals: 6, revenue: 34000 },
  { day: "25", renewals: 3, revenue: 16500 },
  { day: "26", renewals: 8, revenue: 47000 },
  { day: "27", renewals: 2, revenue: 10200 },
  { day: "28", renewals: 7, revenue: 39000 },
  { day: "29", renewals: 5, revenue: 28000 },
  { day: "30", renewals: 6, revenue: 36000 },
];

const RenewalCalender = () => {
  return (
    <ContentLayout>
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Calendar
              size={16}
              strokeWidth={2.75}
              className="text-onboard_primary"
            />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Renewal Calendar
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Visual calendar showing renewal dates
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col border rounded-xl py-2 px-6 justify-center items-center gap-2">
            <span className="flex text-xs ">This Month Renewals</span>
            <span className="flex text-onboard_primary">1250</span>
          </div>
         <div className="flex flex-col border rounded-xl py-2 px-6 justify-center items-center gap-2">
            <span className="flex text-xs ">Renewable revenue expected</span>
            <span className="flex text-onboard_primary">1.25 CR</span>
          </div>
        </div>
      </div>

      <div className="flex p-4 justify-between items-center">
        <div className="w-32">
          <CustomDatePicker pickerType="month" />
        </div>
        <span className="flex text-onboard_primary border rounded-lg p-2 px-6">
          April 2026
        </span>
        <div className="w-32">
          <CustomDatePicker pickerType="month" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 w-full">
        {calendarData.map((data) => (
          <CalenderCard
            key={data.day}
            day={data.day}
            renewals={data.renewals}
            revenue={data.revenue}
          />
        ))}
      </div>
    </ContentLayout>
  );
};

export default RenewalCalender;
