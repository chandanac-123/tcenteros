import ContentLayout from "@common/MasterLayout/ContentLayout";
import ActiveSubcriptionTable from "./Table";
import { StickyNote } from "lucide-react";
import { useSubscriptionsQuery } from "@api-queries/super-admin/subcriptions/Query";
import { useState } from "react";
import CustomFilter from "@common/components/CustomeFilter";

const ActiveSubscriptions = () => {
  const [tableParams, setTableParams] = useState({ page: 1 });
  const [partnerFilter, setPartnerFilter] = useState("all");
  const { data, isLoading, isError } = useSubscriptionsQuery(tableParams);
  // console.log("data: ", data);

  const filteredData = (data?.subscriptions || []).filter(item => {
    if (partnerFilter === "with") {
      return item.partner_name && item.partner_name.trim() !== "";
    }
    if (partnerFilter === "without") {
      return !item.partner_name || item.partner_name.trim() === "";
    }
    return true;
  });

  return (
    <ContentLayout>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-2 sm:px-4 mb-4">
        {/* Title Section */}
        <div className="flex items-center gap-2">
          <div className="p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
            <StickyNote size={24} className="sm:w-[30px] sm:h-[30px]" />
          </div>

          <span className="text-base sm:text-lg font-bold text-gray-800">
            Active Subscriptions
          </span>
        </div>

        {/* Filter */}
        <div className="w-full sm:w-auto">
          <CustomFilter
            value={partnerFilter}
            onApply={(value) => {
              setPartnerFilter(value);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "With Partner", value: "with" },
              { label: "Without Partner", value: "without" },
            ]}
          />
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">


      </div>
      <ActiveSubcriptionTable
        data={{
          ...data,
          subscriptions: filteredData
        }}
        tableParams={tableParams}
        setTableParams={setTableParams}
        isLoading={isLoading}
      />
    </ContentLayout>
  );
};

export default ActiveSubscriptions;
