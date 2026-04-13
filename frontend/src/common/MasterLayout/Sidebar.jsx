import { useBrandingStore } from "@store/brandingStore";
import { routes } from "../../routes/Routes";
import MenuCard from "./MenuCard";
import logo from "@assets/header-icons/logo.svg";
import { sidebarPermission } from "@utils/helper";
import { useAuthStore } from "@store/authStore";

const Sidebar = ({ collapsed, setCollapsed, isMobile, open, setOpen }) => {
  const branding = useBrandingStore((state) => state.branding);
  const permissions = useAuthStore((state) => state.auth?.permissions);
  const hydrated = useAuthStore((state) => state._hasHydrated);

  if (!hydrated) return null;

  return (
    <div
      className={`
  fixed lg:static top-0 left-0 z-50
  h-full bg-secondary
  flex flex-col gap-5 items-center
  transform transition-transform duration-300 ease-in-out
  ${
    isMobile
      ? `w-72 ${open ? "translate-x-0" : "-translate-x-full"}`
      : `${collapsed ? "w-20" : "w-72"}`
  }
`}
    >
      <div className="flex flex-col justify-center items-center">
        <img
          src={branding.logo_url || logo}
          alt=""
          className="w-28 h-28 mt-3"
        />
      </div>
      <div className="flex flex-col gap-1 w-full my-3 px-2 overflow-auto">
        {routes.map((item, index) => {
          const allowed = sidebarPermission(permissions, item.permissionKey);

          if (item?.menubar && allowed) {
            return (
              <MenuCard
                key={index}
                icon={item.icon}
                iconActive={item.iconActive}
                title={item.pageTitle}
                path={item.path}
                collapsed={collapsed}
                onClick={() => isMobile && setOpen(false)}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default Sidebar;
