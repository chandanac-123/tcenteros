import React from 'react'
import { NavLink } from 'react-router-dom'

const MenuCard = ({ icon, title, path }) => {
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
          {isActive ? (
            <span className='text-textwhite'>{icon}</span>
          ) : (
            <span className='text-primary'>{icon}</span>
          )}
          {title}
        </>
      )}
    </NavLink>
  )
}

export default MenuCard
