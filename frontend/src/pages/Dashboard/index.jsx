import { useAuthStore } from "@store/authStore";

import CenterAdminDashboard from "./CenterAdminDashboard";
import SuperAdminDashboard from "@super-admin/dashboard";
import PartnerDashboard from "@partner/dashboard";

const Dashboard = () => {
  const role = useAuthStore((state) => state.auth?.role);

  switch (role) {
    case "superadmin":
      return <SuperAdminDashboard />;

    case "partner":
      return <PartnerDashboard />;

    case "centeradmin":
      return <CenterAdminDashboard />;

    default:
      return <div>Unauthorized Access</div>;
  }
};

export default Dashboard;