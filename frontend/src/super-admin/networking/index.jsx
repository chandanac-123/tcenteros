import { useNetworkQuery } from "@api-queries/super-admin/networking/Query";
import CustomFilter from "@common/components/CustomeFilter";
import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Network } from "lucide-react";
import React, { useState } from "react";
import NetworkTable from "./NetworkTable";

const Networking = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    status: "",
  });
  const { data, isLoading, error } = useNetworkQuery(tableParams);

  const networkingFilter = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
  ];

  const handleFilterApply = (value) => {
    setTableParams((prev) => ({
      ...prev,
      page: 1,
      status: value || "",
    }));
  };

  return (
    <ContentLayout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Network size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Networking Commission
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Monitor the entire platform ecosystem
              </p>
            </div>
          </div>

          <div className="pe-5">
            <CustomFilter
              options={networkingFilter}
              filterName="Status"
              onApply={handleFilterApply}
            />
          </div>
        </div>
        <div className="px-4">
          <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-3 rounded-lg">
            <NetworkTable
              data={data}
              loading={isLoading}
              tableParams={tableParams}
              setTableParams={setTableParams}
            />
          </div>
        </div>
      </div>
    </ContentLayout>
  );
};

export default Networking;
