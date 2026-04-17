import ContentLayout from "@common/MasterLayout/ContentLayout";
import ActiveSubcriptionTable from "./Table";
import { StickyNote } from "lucide-react";

const ActiveSubscriptions = () => {
  return (
    <ContentLayout>
      <div className="flex items-center gap-2 mb-4">
        <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
          <StickyNote size={16} strokeWidth={2.75} />
        </div>
        <span className="text-lg font-bold text-gray-800 mb-0">
          Active Subscriptions
        </span>
      </div>
      <ActiveSubcriptionTable />
    </ContentLayout>
  );
};

export default ActiveSubscriptions;
