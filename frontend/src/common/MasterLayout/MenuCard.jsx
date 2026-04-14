import React from "react";

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

  const isActive = location.pathname.startsWith(path);

  return (
    <NavLink to={path} className="w-full">
      <div
        onClick={onClick}
        className={`flex items-center ${
          collapsed ? "justify-center" : "gap-2"
        } px-3 py-2 rounded-lg cursor-pointer transition
        ${isActive ? "bg-primary text-white" : "text-white"}`}
      >
        <span className={isActive ? "text-textwhite" : "text-primary"}>
          {icon}
        </span>

        {!collapsed && (
          <>
            <span>{title}</span>

            {hasSubmenu && (
              <span className="ml-auto">
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </span>
            )}
          </>
        )}
      </div>

      {/* SUBMENU */}
      {!collapsed && children}
    </NavLink>
  );
};

export default MenuCard;
