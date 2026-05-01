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
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
            <StickyNote size={30} />
          </div>
          <span className="text-lg font-bold text-gray-800 mb-0">
            Active Subscriptions
          </span>
        </div>

        <div className="">
          <CustomFilter
            value={partnerFilter}
            onApply={(value) => {
              console.log("Selected:", value);
              setPartnerFilter(value);
            }}
            options={[
              { label: "All", value: "all" },
              { label: "With Partner", value: "with" },
              { label: "Without Partner", value: "without" }
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
