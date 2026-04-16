import { useAuthStore } from "@store/authStore";
import CenterAdminDashboard from "./CenterAdminDashboard";
import SuperAdminDashboard from "@super-admin/dashboard";

const Dashboard = () => {
  const role = useAuthStore((state) => state.auth?.role);

  return (
    <>
      {role === "superadmin" ? (
        <SuperAdminDashboard />
      ) : (
        <CenterAdminDashboard />
      )}
    </>
  );
};

export default Dashboard;
