import ContentLayout from "@common/MasterLayout/ContentLayout";
import ActiveSubcriptionTable from "./Table";
import { StickyNote } from "lucide-react";
import { useSubscriptionsQuery } from "@api-queries/super-admin/subcriptions/Query";
import { useState } from "react";

const ActiveSubscriptions = () => {
  const [tableParams, setTableParams] = useState({ page: 1 });
  const { data, isLoading, isError } = useSubscriptionsQuery(tableParams);
  console.log("data: ", data);

  return (
    <ContentLayout>
      <div className="flex items-center gap-2 mb-4">
        <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
          <StickyNote size={30} />
        </div>
        <span className="text-lg font-bold text-gray-800 mb-0">
          Active Subscriptions
        </span>
      </div>
      <ActiveSubcriptionTable
        data={data}
        tableParams={tableParams}
        setTableParams={setTableParams}
        isLoading={isLoading}
      />
    </ContentLayout>
  );
};

export default ActiveSubscriptions;
