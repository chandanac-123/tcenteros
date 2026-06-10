import CustomDatePicker from "@common/components/CustomeDatepicker";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Calendar } from "lucide-react";
import React, { useState } from "react";
import CalenderCard from "../components/CalenderCard";
import { useNavigate } from "react-router-dom";
import { useRenewalCalendarQuery } from "@api-queries/super-admin/subcriptions/Query";
import { getTodayFormattedMonthYear } from "@utils/helper";

const RenewalCalender = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [tableParams, setTableParams] = useState({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  });
  const { data, isLoading, error } = useRenewalCalendarQuery(tableParams);
  const currentDay = data?.summary?.current_day;

  return (
    <ContentLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4 p-2 sm:p-4">
          <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Calendar size={24} className="text-onboard_primary sm:w-[30px] sm:h-[30px]" />
          </div>

          <div className="flex flex-col justify-center gap-1">
            <p className="text-[#3A3A3A] font-semibold text-base sm:text-lg">
              Renewal Calendar
            </p>
            <p className="text-[#393636] text-xs sm:text-sm">
              Visual calendar showing renewal dates
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
          <div className="flex flex-col border rounded-xl py-3 px-4 justify-center items-center gap-2">
            <span className="text-xs text-center">
              This Month Renewals
            </span>
            <span className="text-onboard_primary font-semibold">
              {data?.summary?.month_renewal_count}
            </span>
          </div>

          <div className="flex flex-col border rounded-xl py-3 px-4 justify-center items-center gap-2">
            <span className="text-xs text-center">
              Renewable Revenue Expected
            </span>
            <span className="text-onboard_primary font-semibold">
              {data?.summary?.month_expected_revenue}
            </span>
          </div>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex flex-col sm:flex-row gap-4 p-2 sm:p-4 justify-between sm:items-center">
        <span className="text-onboard_primary border rounded-lg p-2 px-4 sm:px-6 text-center sm:text-left">
          {getTodayFormattedMonthYear()}
        </span>

        <div className="w-full sm:w-40">
          <CustomDatePicker
            value={new Date(tableParams.year, tableParams.month - 1)}
            pickerType="month"
            onChange={(val) => {
              if (!val) return;
              setTableParams({
                year: val.year,
                month: val.month,
              });
            }}
          />
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 p-2 sm:p-4 w-full">
        {data?.daily_breakdown?.map((item) => {
          const isToday = item.date === currentDay;

          return (
            <CalenderCard
              key={item.date}
              onClick={() =>
                navigate(
                  `/subscriptions/renewal-calender/detail/${item?.date}`
                )
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
