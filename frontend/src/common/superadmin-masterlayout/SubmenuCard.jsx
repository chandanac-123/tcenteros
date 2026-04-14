import React from "react";
import { NavLink } from "react-router-dom";

const SubmenuCard = ({ submenu = [], parentPath, collapsed, onClick }) => {
  return (
    <div className="flex flex-col gap-1 pl-6 mt-1">
      {submenu.map((item) => {
        const fullPath = `/${parentPath}/${item.path}`;

        return (
          <NavLink
            key={item.key}
            to={fullPath}
            onClick={onClick}
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                isActive
                  ? " text-white"
                  : "text-white/70 hover:text-white"
              }`
            }
          >
            <span className={`w-2 h-2 rounded-full bg-white/70`} />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        );
      })}
    </div>
  );
};

export default SubmenuCard;
