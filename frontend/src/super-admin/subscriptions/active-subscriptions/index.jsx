import ContentLayout from "@common/MasterLayout/ContentLayout";
import ActiveSubcriptionTable from "./Table";
import active_subcription from "@assets/superadmin-other/active-subcription.svg";

const ActiveSubscriptions = () => {
  return (
    <ContentLayout>
      <div className="flex items-center gap-2">
        <img
          src={active_subcription}
          alt="Active Subscription"
          className="w-12 h-12"
        />
        <span className="text-lg font-bold text-gray-800 mb-0">
          Active Subscriptions
        </span>
      </div>
      <ActiveSubcriptionTable />
    </ContentLayout>
  );
};

export default ActiveSubscriptions;
