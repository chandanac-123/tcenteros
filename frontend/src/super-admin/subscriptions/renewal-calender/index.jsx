import CustomDatePicker from "@common/components/CustomeDatepicker";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Calendar, Handshake } from "lucide-react";
import React from "react";
import CalenderCard from "../components/CalenderCard";
import { useNavigate } from "react-router-dom";
import { useRenewalCalendarQuery } from "@api-queries/super-admin/subcriptions/Query";
import { getTodayFormattedMonthYear } from "@utils/helper";

const RenewalCalender = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useRenewalCalendarQuery();
   const currentDay = data?.summary?.current_day;

  return (
    <ContentLayout>
      <div className="flex items-center justify-between ">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Calendar
              size={30}
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
            <span className="flex text-onboard_primary">{data?.summary?.month_renewal_count}</span>
          </div>
          <div className="flex flex-col border rounded-xl py-2 px-6 justify-center items-center gap-2">
            <span className="flex text-xs ">Renewable revenue expected</span>
            <span className="flex text-onboard_primary">{data?.summary?.month_expected_revenue}</span>
          </div>
        </div>
      </div>

      <div className="flex p-4 justify-between items-center">
        <span className="flex text-onboard_primary border rounded-lg p-2 px-6">
          {getTodayFormattedMonthYear}
        </span>
        <div className="w-32">
          <CustomDatePicker pickerType="month" />
        </div>
      </div>


<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 w-full">
  {data?.daily_breakdown.map((item) => {
    const isToday = item.date === currentDay;
    return (
      <CalenderCard
        key={item.date}
        onClick={() =>
          navigate(`/subscriptions/renewal-calender/detail/${item.id}`)
        }
        day={item.date.split("-")[2]}
        renewals={item.renewal_count}
        revenue={item.renewal_amount}
        isToday={isToday} 
        loading={isLoading}
      />
    );
  })}
</div>
    </ContentLayout>
  );
};

export default RenewalCalender;
