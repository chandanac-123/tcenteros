import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Button } from "@pages/components/ui/button";
import { Handshake, RefreshCcw } from "lucide-react";
import PartnerTableList from "./components/partnerTableList";
import { useGetPartnersOverviewQuery } from "@api-queries/super-admin/partners/Query";
import { useState } from "react";
import { useRunAllCommissionsMutation } from "@api-queries/super-admin/revenue-billing/Query";

const Partners = () => {
  const [tableParams, setTableParams] = useState({
    page: 1,
  });

  const { data, isLoading } = useGetPartnersOverviewQuery(tableParams);
  const { mutateAsync: runAllCommissions } = useRunAllCommissionsMutation();

  return (
    <ContentLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* Title Section */}
          <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-4">
            <div className="p-2 sm:p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <Handshake
                size={24}
                className="text-onboard_primary sm:w-[30px] sm:h-[30px]"
              />
            </div>

            <div className="flex flex-col justify-center gap-1 sm:gap-2">
              <p className="text-base sm:text-[18px] font-semibold text-[#3A3A3A]">
                Partners Management
              </p>

              <p className="text-xs sm:text-[14px] font-medium text-[#393636]">
                Manage reseller partners and commissions
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="px-2 sm:px-5 w-full lg:w-auto">
            <Button
              size="addbutton"
              className="w-full lg:w-auto justify-center"
              onClick={() => runAllCommissions()}
            >
              <RefreshCcw className="w-4 h-4" />
              Commission Run
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="px-2 sm:px-4 py-3 overflow-x-auto">
          <PartnerTableList
            isLoading={isLoading}
            data={data}
            tableParams={tableParams}
            setTableParams={setTableParams}
          />
        </div>
      </div>
    </ContentLayout>
  );
};

export default Partners;