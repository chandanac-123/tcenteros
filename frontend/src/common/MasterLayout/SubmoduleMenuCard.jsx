import React from 'react'
import { NavLink } from 'react-router-dom'

const SubmoduleMenuCard = ({ title, path, active }) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-2 text-sm px-4 py-2 rounded-md transition-colors duration-200 ${
          isActive || active ? 'bg-primary/20 text-white' : 'bg-white text-primary'
        }`
      }
    >
      <span className='w-2 h-2 rounded-full bg-primary inline-block mr-2'></span>
      <span>{title}</span>
    </NavLink>
  )
}

export default SubmoduleMenuCard
