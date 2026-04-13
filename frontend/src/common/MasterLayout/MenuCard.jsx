import React from "react";
import { NavLink } from "react-router-dom";

const MenuCard = ({ icon, title, path, collapsed }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `inline-flex items-center ${
          collapsed ? "justify-center" : "gap-2"
        } text-base px-3 py-2 rounded-lg transition-colors text-white duration-200 ${
          isActive ? "bg-primary" : "bg-transparent"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* ICON */}
          <span className={isActive ? "text-textwhite" : "text-primary"}>
            {icon}
          </span>

          {/* TEXT (hide when collapsed) */}
          {!collapsed && <span>{title}</span>}
        </>
      )}
    </NavLink>
  );
};

export default MenuCard;
