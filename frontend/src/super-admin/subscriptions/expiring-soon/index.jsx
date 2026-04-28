import ContentLayout from "@common/MasterLayout/ContentLayout";
import { ClockAlert } from "lucide-react";
import ExpiringTable from "./ExpiringTable";
import { useRenewalExpiringQuery } from "@api-queries/super-admin/subcriptions/Query";
import CustomFilter from "@common/components/CustomeFilter";
import { useState } from "react";
const filterVlaue = [
  { value: 3, label: "Expiring in 3 days" },
  { value: 7, label: "Expiring in 7 days" },
  { value: 15, label: "Expiring in 15 days" },
  { value: 30, label: "Expiring in 30 days" },
];
const ExpiringSoon = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    expiry: 30,
  });
  const { data, isLoading, isError } = useRenewalExpiringQuery(tableParams);

  const updateFilter = (key, value) => {
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      [key]: value,
    }));
  };

  return (
    <ContentLayout>
      <div className="flex justify-between">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <ClockAlert size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Expiring Soon
            </p>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              {data?.summary?.total_expiring_count} centres require renewal
              attention
            </p>
          </div>
        </div>
        <div
          className={`flex flex-col border rounded-xl p-2 w-40 gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.15)] cursor-pointer`}
        >
          <div className="flex gap-1 items-center justify-start">
            <span
              className={`flex rounded-full w-6 h-6 border text-xs font-semibold text-red_text justify-center items-center shadow-[0px_5px_15px_rgba(0,0,0,0.15)]
        `}
            >
              {data?.days_until_expiry}
            </span>
            <span className="flex text-xs text-grey_text"> Days Remaining</span>
          </div>

          <div className="flex flex-col justify-center items-center gap-2">
            <span className="flex text-xs text-red_text font-semibold">
              {" "}
              {data?.summary?.total_expiring_count} Centers
            </span>
            <span className="flex text-xs text-grey_text">
              {" "}
              ₹ {data?.summary?.total_expected_revenue}{" "}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <CustomFilter
          filterName="Expire days"
          options={filterVlaue}
          value={tableParams.expiry}
          onApply={(value) => updateFilter("expiry", value)}
        />

        <ExpiringTable
          data={data?.daily_breakdown}
          isLoading={isLoading}
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      </div>
    </ContentLayout>
  );
};

export default ExpiringSoon;
