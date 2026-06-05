import ContentLayout from "@common/MasterLayout/ContentLayout";
import { useNetworkOnlyCenterQuery } from "@api-queries/super-admin/subcriptions/Query";
import { useState } from "react";
import Table from "./ExpiringTable";
import { CloudSync, Network } from "lucide-react";

const ActiveNetworkCenters = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
    expiry: 30,
  });
  const { data, isLoading, isError } = useNetworkOnlyCenterQuery(tableParams);

  return (
    <ContentLayout>
      <div className="flex justify-between">
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <CloudSync size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Networking Centers
            </p>
            {/* <p className="text-[#393636] font-inter text-[14px] font-medium">
              {data?.summary?.total_expiring_count} centres require renewal
              attention
            </p> */}
          </div>
        </div>
     
      </div>
      <div className="flex flex-col gap-3">
      
        <Table
          data={data?.network_centers}
          isLoading={isLoading}
          tableParams={tableParams}
          setTableParams={setTableParams}
        />
      </div>
    </ContentLayout>
  );
};

export default ActiveNetworkCenters;
