import logo from '@assets/header-icons/logo_in_auth.svg'

const OnboardHeader = () => {
  return (
    <header className='flex items-center px-4 sm:px-10 py-5'>
      <img src={logo} alt='Logo' className='w-32 h-16' />
    </header>
  )
}

export default OnboardHeader
