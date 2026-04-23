import { useBrandingStore } from "@store/brandingStore";
import { routes } from "../../routes/Routes";
import MenuCard from "./MenuCard";
import logo from "@assets/header-icons/logo.svg";
import { sidebarPermission } from "@utils/helper";
import { useAuthStore } from "@store/authStore";
import SubmenuCard from "@common/superadmin-masterlayout/SubmenuCard";
import React, { useEffect, useMemo, useState } from "react";

import { useLocation } from "react-router-dom";

const Sidebar = ({ collapsed, isMobile, open, setOpen }) => {
  const branding = useBrandingStore((state) => state.branding);
  const permissions = useAuthStore((state) => state.auth?.permissions);
  const hydrated = useAuthStore((state) => state._hasHydrated);
  const location = useLocation();
  const [openMenuKey, setOpenMenuKey] = useState(null);

  const role = useAuthStore((state) => state.auth?.role);
  const isSuperAdmin = role === "superadmin";
  const isPartner = role === "partner";

  const filteredRoutes = useMemo(() => {
    return routes.filter((item) => {
      if (item.alwaysVisible) return true; // Show for all roles
      if (isSuperAdmin) return item.isSuperAdmin === true;
      if (isPartner) return item.isPartner === true;
      return item.isSuperAdmin !== true && item.isPartner !== true;
    });
  }, [isSuperAdmin, isPartner]);

  useEffect(() => {
    const activeMenu = filteredRoutes.find((item) => isSubmenuActive(item));
    if (activeMenu) {
      //  Open submenu if inside it
      setOpenMenuKey(activeMenu.key);
    } else {
      //  Close submenu if navigating outside
      setOpenMenuKey(null);
    }
  }, [location.pathname]);

  if (!hydrated) return null;

  const isSubmenuActive = (item) => {
    if (!item.submodules) return false;

    return item.submodules.some((sub) =>
      location.pathname.startsWith(
        `/${item.path.replace(/^\//, "")}/${sub.path}`,
      ),
    );
  };

  return (
    <div
      className={`fixed lg:static top-0 left-0 z-50 h-full bg-secondary flex flex-col gap-5 items-center transition-all duration-300
      ${
        isMobile
          ? `w-72 ${open ? "translate-x-0" : "-translate-x-full"}`
          : `${collapsed ? "w-20" : "w-72"}`
      }`}
    >
      {/* LOGO */}
      <div className="flex justify-center items-center">
        <img src={branding.logo_url || logo} className="w-28 h-28 mt-3" />
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-1 w-full my-3 px-2 overflow-auto">
        {filteredRoutes.map((item) => {
          const allowed = sidebarPermission(permissions, item.permissionKey);
          if (!item?.menubar || !allowed) return null;
          const hasSubmenu = item.submodules?.length > 0;
          const isOpen = openMenuKey === item.key;
          return (
            <MenuCard
              key={item.key}
              icon={item.icon}
              title={item.pageTitle}
              path={item.path}
              collapsed={collapsed}
              hasSubmenu={hasSubmenu}
              isOpen={isOpen}
              onClick={() => {
                if (hasSubmenu) {
                  setOpenMenuKey((prev) =>
                    prev === item.key ? null : item.key,
                  );
                } else {
                  setOpenMenuKey(null);
                }
                if (isMobile) setOpen(false);
              }}
            >
              {hasSubmenu && isOpen && (
                <SubmenuCard
                  submenu={item?.submodules?.filter((sub) => sub?.menubar)}
                  parentPath={item.path.replace(/^\//, "")}
                  collapsed={collapsed}
                  onClick={() => isMobile && setOpen(false)}
                />
              )}
            </MenuCard>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
