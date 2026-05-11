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

  const auth = useAuthStore((state) => state.auth);
  const role = auth?.role;
  const centerId = auth?.center_id; // "superadmin" | "centeradmin"
  const isEmployee = role === "employee";
  const isPartner = role === "partner";

  // Determine which route group employee belongs to
  const isSuperAdmin = role === "superadmin" || (isEmployee && !centerId);

  const isCenterAdmin = role === "centeradmin" || (isEmployee && !!centerId);

  const filteredRoutes = useMemo(() => {
    return routes.filter((item) => {
      // Always visible routes (e.g. Dashboard)
      if (item.alwaysVisible) return true;

      // Partner routes
      if (isPartner) {
        return item.isPartner === true;
      }

      // Super Admin + Super Admin Employee
      if (isSuperAdmin) {
        return item.isSuperAdmin === true;
      }

      // Center Admin + Center Admin Employee
      if (isCenterAdmin) {
        return item.isSuperAdmin !== true && item.isPartner !== true;
      }

      return false;
    });
  }, [isSuperAdmin, isCenterAdmin, isPartner]);

  const isSubmenuActive = (item) => {
    if (!item.submodules) return false;

    return item.submodules.some((sub) =>
      location.pathname.startsWith(
        `/${item.path.replace(/^\//, "")}/${sub.path}`,
      ),
    );
  };

  useEffect(() => {
    const activeMenu = filteredRoutes.find((item) => isSubmenuActive(item));

    if (activeMenu) {
      setOpenMenuKey(activeMenu.key);
    } else {
      setOpenMenuKey(null);
    }
  }, [location.pathname, filteredRoutes]);

  if (!hydrated) return null;

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
        <img
          src={branding.logo_url || logo}
          className="w-28 h-28 mt-3"
          loading="lazy"
          alt="Logo"
        />
      </div>

      {/* MENU */}
      <div className="flex flex-col gap-1 w-full my-3 px-2 overflow-auto">
        {filteredRoutes.map((item) => {
          const allowed = sidebarPermission(permissions, item.permissionKey);

          if (!item.menubar || !allowed) return null;

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
                  submenu={item.submodules.filter((sub) => sub.menubar)}
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
