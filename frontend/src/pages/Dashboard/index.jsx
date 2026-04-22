import { useAuthStore } from "@store/authStore";
import CenterAdminDashboard from "./CenterAdminDashboard";
import SuperAdminDashboard from "@super-admin/dashboard";
import PartnerDashboard from "@partner/dashboard";

const Dashboard = () => {
  const role = useAuthStore((state) => state.auth?.role);

  return (
    <>
      {role === "superadmin" ? (
        <SuperAdminDashboard />
      ) : role === "partner" ? (
        <PartnerDashboard />
      ) : (
        <CenterAdminDashboard />
      )}
    </>
  );
};

export default Dashboard;
