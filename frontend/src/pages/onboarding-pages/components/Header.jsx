import logo from '@assets/header-icons/logo_in_auth.svg'
import { useState } from 'react'
import { ArrowRight, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const navLinks = [
  { label: 'Home', href: '#about' },
  { label: 'About Us', href: '#contact' },
  { label: 'Centers', href: '#contact' },
  { label: 'Blogs', href: '#contact' }
]

const Header = () => {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <header className='flex items-center justify-between px-4 sm:px-10 py-4'>
      {/* Logo */}
      <img src={logo} alt='Logo' className='w-28 sm:w-32 h-auto' />

      {/* Desktop Nav */}
      <nav className='hidden md:flex items-center gap-6 text-grey font-roboto text-md'>
        {navLinks.map(({ label, href }) => (
          <a key={label} href={href} className='hover:text-blue-600'>
            {label}
          </a>
        ))}
        <button
          onClick={() => navigate('/login')}
          className='bg-onboard_primary flex items-center gap-2 text-textwhite px-4 py-1 rounded-lg'
        >
          Login <ArrowRight className='w-4 h-4 text-textwhite' />
        </button>
      </nav>

      {/* Mobile Menu Button */}
      <button className='md:hidden' onClick={() => setOpen(prev => !prev)}>
        {open ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {open && (
        <div className='absolute top-16 left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden z-50'>
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className='text-grey'>
              {label}
            </a>
          ))}
          <button
            onClick={() => navigate('/login')}
            className='bg-onboard_primary flex items-center gap-2 text-textwhite px-4 py-1 rounded-lg'
          >
            Login <ArrowRight className='w-4 h-4 text-textwhite' />
          </button>
        </div>
      )}
    </header>
  )
}

export default Header
