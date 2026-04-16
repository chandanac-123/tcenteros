import { ChevronDown, ChevronUp } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const MenuCard = ({
  icon,
  title,
  path,
  collapsed,
  children,
  hasSubmenu,
  isOpen,
  onClick,
}) => {
  const location = useLocation();

  const isActive =
    location.pathname === path || location.pathname.startsWith(path + "/");

  // ✅ NORMAL MENU (NO SUBMENU)
  if (!hasSubmenu) {
    return (
      <NavLink to={path} className="w-full">
        {({ isActive }) => (
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "gap-2"
            } px-3 py-2 rounded-lg transition
            ${isActive ? "bg-primary text-white" : "text-white"}`}
          >
            <span className={isActive ? "text-white" : "text-primary"}>
              {icon}
            </span>
            {!collapsed && <span>{title}</span>}
          </div>
        )}
      </NavLink>
    );
  }

  // ✅ MENU WITH SUBMENU → ONLY TOGGLE
  return (
    <div className="w-full">
      <div
        onClick={onClick}
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-2"
        } px-3 py-2 rounded-lg cursor-pointer transition
        ${isActive ? "bg-primary text-white" : "text-white"}`}
      >
        <span className={isActive ? "text-white" : "text-primary"}>{icon}</span>

        {!collapsed && (
          <>
            <span>{title}</span>
            <span className="ml-auto">
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </span>
          </>
        )}
      </div>

      {/* SUBMENU */}
      {!collapsed && children}
    </div>
  );
};

export default MenuCard;
