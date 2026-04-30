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



console.log("Data",data);


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
     
      </div>
      <div className="flex flex-col gap-3">
      
        <ExpiringTable
          data={data}
          isLoading={isLoading}
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      </div>
    </ContentLayout>
  );
};

export default ExpiringSoon;
