import bell from "@assets/header-icons/bell.svg";
import bell_active from "@assets/header-icons/bell-inactive.svg";
import map from "@assets/header-icons/map.svg";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@pages/components/ui/popover";
import {
  ChevronDown,
  ListIndentDecrease,
  ListIndentIncrease,
  LogOut,
  Settings,
  SquarePen,
  UserRound,
} from "lucide-react";
import CustomeModal from "../components/CustomeModal";
import { useState } from "react";
import { Button } from "@pages/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@store/authStore";
import { useCrmStore } from "@store/tabStore";
import { useGetProfileInfoQuery } from "@api-queries/center-admin/center-profile/Query";
import GoogleMapComponent from "../components/GoogleMapComponent";
import defalutUser from "@assets/header-icons/user.svg";
import { useAppPermissions } from "@hooks/index";
import AdminProfileModal from "@super-admin/admin-profile";
import { useSuperadminProfileQuery } from "@api-queries/super-admin/profile/Query";
import AddBranchModal from "@pages/branch/dashboard-branch/AddBranchModal";
import ChangePassword from "./ChangePassword";
import { useNotificationCountQuery } from "@api-queries/center-admin/notifictaions/Query";

const Header = ({ toggleSidebar, collapsed }) => {
  const [openAddBranch, setOpenAddbranch] = useState(false);
  const is_subcenter = useAuthStore((state) => state.auth?.is_subcenter);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const role = useAuthStore((state) => state.auth?.role);
  const isSuperAdmin = role === "superadmin";
  const isPartner = role === "partner";
  const isCenterAdmin = role === "centeradmin";
  const { hydrated, canAddMember, canViewNotifications, canAddBranch } =
    useAppPermissions();
  if (!hydrated) return null;
  const { setSelectedTab, setMemberView } = useCrmStore();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { data } = useGetProfileInfoQuery();
  const { data: superadminData, isFetching } = useSuperadminProfileQuery();
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  const [openAdminProfile, setOpemAdminProfile] = useState(false);
  const { data: notification_count, isFetching: isNotification } = useNotificationCountQuery()
  console.log('notification_count: ', notification_count);

  const handleLogout = () => {
    const state = useAuthStore.getState();
    if (state.clearAuth) state.clearAuth();
    setLogoutOpen(false);
  };

  const handleOpenBranch = () => {
    setOpenAddbranch(true);
  };
  return (
    <header className="w-full bg-secondary shadow flex items-center justify-between min-h-16 px-3 py-2">
      <div className="flex items-center bg-secondary">
        <button onClick={toggleSidebar} className="text-white text-xl">
          {collapsed ? <ListIndentIncrease /> : <ListIndentDecrease />}
        </button>
      </div>
      <div className="flex flex-1 justify-end items-center gap-2 text-gray-200 min-w-0">
        {!isSuperAdmin && !isPartner && (
          <div className="flex w-full justify-end gap-2 items-center">
            <button onClick={() => setLocationOpen(true)}>
              <span className="flex items-center text-xs font-normal gap-1 capitalize bg-search_bg px-2 py-2 rounded-md whitespace-nowrap">
                <img src={map} alt="" className="w-5 h-5" loading="lazy" />
                <span className="hidden sm:inline">Location</span>
              </span>
            </button>
            <GoogleMapComponent
              open={locationOpen}
              setLocationOpen={setLocationOpen}
            />
            {!is_subcenter && <Button
              disabled={!canAddBranch}
              size="addbutton"
              onClick={handleOpenBranch}
            >
              <span className="hidden sm:inline">+ Add Branch</span>
              <span className="sm:hidden">+</span>
            </Button>}
            <AddBranchModal
              open={openAddBranch}
              onOpenChange={setOpenAddbranch}
            />
            <Button
              disabled={!canAddMember}
              size="addbutton"
              onClick={() => {
                setSelectedTab(1);
                setMemberView("add");
                navigate("/crm");
              }}
            >
              <span className="hidden sm:inline">+ Add Member</span>
              <span className="sm:hidden">+</span>
            </Button>
          </div>
        )}
        {!isPartner && canViewNotifications && (
          <button onClick={() => navigate("/notifications")}>
            <img src={notification_count?.total_notifications > 0 ? bell_active : bell} alt="logo" className="mr-2" loading="lazy" />
          </button>
        )}

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild onClick={() => setPopoverOpen(true)}>
            <div className="flex border border-textwhite rounded-full px-2 py-1 items-center cursor-pointer max-w-[180px] sm:max-w-none">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-0">
                  <img
                    loading="lazy"
                    src={
                      data?.profile_photo ||
                      superadminData?.profile_photo ||
                      defalutUser
                    }
                    alt="logo"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="hidden sm:flex flex-col">
                    <span className="text-textwhite text-xs font-normal whitespace-nowrap capitalize">
                      {data?.full_name || superadminData?.fullname || "-"}
                    </span>
                    <span className="text-textwhite/50 text-xs font-light capitalize">
                      {data?.role || superadminData?.role || "-"}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-textwhite" />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <div className="flex flex-col gap-2">
              {!isPartner && (
                <button
                  onClick={() => {
                    if (isSuperAdmin) {
                      setOpemAdminProfile(true);
                    } else {
                      navigate("/profile");
                    }
                    setPopoverOpen(false);
                  }}
                  className="flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded"
                >
                  <UserRound className="w-5 h-5 text-primary" />
                  Profile
                </button>
              )}
              {isCenterAdmin && (
                <button
                  onClick={() => {
                    navigate("/settings");
                    setPopoverOpen(false);
                  }}
                  className="flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded"
                >
                  <Settings className="w-5 h-5 text-primary" />
                  Settings
                </button>
              )}
              <button
                onClick={() => setChangePasswordOpen(true)}
                className="flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded"
              >
                <SquarePen className="w-5 h-5 text-primary" />
                Change Password
              </button>
              <button
                onClick={() => setLogoutOpen(true)}
                className="flex items-center gap-2 text-left hover:bg-textwhite px-2 py-1 rounded"
              >
                <LogOut className="w-5 h-5 text-primary" />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <CustomeModal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        header="Logout"
      >
        Are you sure you want to logout?
        <div className="flex justify-end  gap-4">
          <Button
            onClick={() => setLogoutOpen(false)}
            size="addbutton"
            variant="outline_secondary"
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            size="addbutton"
            variant="default"
            type="button"
          >
            Logout
          </Button>
        </div>
      </CustomeModal>

      <AdminProfileModal
        open={openAdminProfile}
        setOpen={setOpemAdminProfile}
      />
      <ChangePassword open={changePasswordOpen} setOpen={setChangePasswordOpen} />
    </header>
  );
};
export default Header;
