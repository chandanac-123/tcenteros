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
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-2 sm:p-4">
            <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)] shrink-0">
              <Network size={24} className="text-onboard_primary sm:w-[30px] sm:h-[30px]" />
            </div>

            <div className="flex flex-col justify-center gap-1 sm:gap-2">
              <p className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
                Networking Commission
              </p>

              <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
                Monitor the entire platform ecosystem
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="px-2 sm:px-5 w-full lg:w-auto">
            <div className="w-full lg:w-auto">
              <CustomFilter
                options={networkingFilter}
                filterName="Status"
                onApply={handleFilterApply}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-2 sm:px-4">
          <div className="shadow-[0px_5px_15px_rgba(0,0,0,0.35)] p-2 sm:p-3 rounded-lg overflow-x-auto">
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
