import React from 'react'
import { NavLink } from 'react-router-dom'


const MenuCard = ({
  icon,
  iconActive,
  title,
  path,
}) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 text-base px-3 py-2 rounded-lg transition-colors  text-white duration-200 ${
          isActive ? 'bg-primary' : 'bg-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <img alt='' src={isActive && iconActive ? iconActive : icon} />
          {title}
        </>
      )}
    </NavLink>
  )
}

export default MenuCard
