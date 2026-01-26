import logo from '@assets/images/logo.svg'

const navLinks = [
  { label: 'Home', href: '#about' },
  { label: 'About Us', href: '#contact' },
  { label: 'Centers', href: '#contact' },
  { label: 'Services', href: '#contact' },
]

const Header = () => {
  return (
    <header className='flex items-center justify-between px-4 sm:px-10 py-5'>
      <img src={logo} alt='Logo' className='w-auto' />

      <nav className='hidden md:flex space-x-6 text-grey font-roboto text-md'>
        {navLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className='hover:text-blue-600'
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default Header
