import logo from '@assets/images/logo.svg'

const OnboardHeader = () => {
  return (
    <header className='flex items-center px-4 sm:px-10 py-5'>
      <img src={logo} alt='Logo' className='w-auto' />
    </header>
  )
}

export default OnboardHeader
