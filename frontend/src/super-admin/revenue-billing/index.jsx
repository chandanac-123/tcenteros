import ContentLayout from "@common/MasterLayout/ContentLayout";
import { Outlet } from "react-router-dom";

const RevenueBillingLayout = () => {
  return (
    <ContentLayout>
      <Outlet />
    </ContentLayout>
  );
};

export default RevenueBillingLayout;
