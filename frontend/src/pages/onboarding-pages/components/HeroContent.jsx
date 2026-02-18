import { Button } from '@pages/components/ui/button'
import nextarrow from '@assets/navigate-icons/nextarrow.svg'
import { useNavigate } from 'react-router-dom'

const HeroContent = () => {
  const navigate = useNavigate()
  return (
    <div className='w-full md:w-1/2 flex flex-col gap-12 pt-6 pb-16 relative'>
      {/* Text */}
      <div className='space-y-6'>
        <h1 className='text-3xl sm:text-4xl font-bold font-roboto text-primary'>
          Let's Create a software to <br />
          manage <span className='text-secondary'>your center</span>
        </h1>

        <p className='text-grey sm:w-2/3'>
          Tell us a little about your fitness center and we'll recommend the
          best white-label software package for you.
        </p>
      </div>

      {/* CTA */}
      <div className='mt-auto space-y-6 text-center md:text-left'>
        <h2 className='text-2xl text-primary'>
          Takes less than
          <span className='text-secondary font-bold text-4xl'> 2</span> minutes.
        </h2>

        <Button
          variant='default'
          size='landing'
          rightIcon={nextarrow}
          onClick={() => navigate('/type-selection')}
        >
          Start
        </Button>
      </div>

      {/* Footer links */}
      <div className='absolute bottom-4 left-0 text-xs sm:text-sm text-grey flex gap-4'>
        <a href='#terms' className='hover:text-primary'>
          Terms & Conditions
        </a>
        <a href='#privacy' className='hover:text-primary'>
          Privacy Policy
        </a>
      </div>
    </div>
  )
}

export default HeroContent
