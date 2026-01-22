import logo from '@assets/images/logo.svg'
import PrimaryLayout from '@components/onboardlayouts/PrimaryLayout'
import LandingImage from '@assets/images/landingimg.svg'
import { Button } from '@pages/components/ui/button'
import nextarrow from '@assets/images/nextarrow.svg'

const Landing = () => {
  return (
    <PrimaryLayout>
      {/* Header */}
      <header className='flex items-center justify-between px-10 py-5 '>
        {/* Left Logo */}
        <div className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className=' w-auto' />
        </div>

        {/* Right Menu */}
        <nav className='space-x-6 text-grey font-roboto font-normal text-md gap-12'>
          <a href='#about' className='hover:text-blue-600 '>
            Home
          </a>
          <a href='#contact' className='hover:text-blue-600  '>
            About US
          </a>
          <a href='#contact' className='hover:text-blue-600'>
            Centers
          </a>
          <a href='#contact' className='hover:text-blue-600'>
            Services
          </a>
        </nav>
      </header>

      {/* Main Section */}
      <main className='min-h-screen flex flex-col md:flex-row px-20 justify-center items-center'>

        {/* LEFT */}
        <div className='md:w-1/2 flex flex-col gap-16 pt-8 pb-16 relative'>
          {/* Top Content */}
          <div className='space-y-6'>
            <h1 className='text-4xl font-bold font-roboto text-primary'>
              Let's Create a software to
              <br />
              manage <span className='text-secondary'>your center</span>
            </h1>

            <p className='text-grey w-2/3'>
              Tell us a little about your fitness center and we'll recommend the
              best white-label software package for you.
            </p>
          </div>

          {/* CTA */}
          <div className='mt-auto space-y-6'>
            <h2 className='text-2xl text-primary'>
              Takes less than
              <span className='text-secondary font-bold text-4xl'> 2</span>{' '}
              minutes.
            </h2>

            <Button variant='default' size='landing' rightIcon={nextarrow}>
              Start
            </Button>
          </div>

          {/* Bottom-left links */}
          <div className='absolute bottom-4 left-0 text-sm text-grey flex gap-6'>
            <a href='#terms' className='hover:text-primary '>
              Terms & Conditions
            </a>
            <a href='#privacy' className='hover:text-primary '>
              Privacy Policy
            </a>
          </div>
        </div>

        {/* RIGHT */}
        <div className='md:w-1/2 flex items-end justify-center pb-2'>
          <img src={LandingImage} alt='Hero' className='max-w-md w-full' />
        </div>
      </main>
    </PrimaryLayout>
  )
}

export default Landing
