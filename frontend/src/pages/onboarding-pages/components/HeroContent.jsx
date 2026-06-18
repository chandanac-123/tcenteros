import { Button } from '@pages/components/ui/button'
import nextarrow from '@assets/navigate-icons/nextarrow.svg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import PrivacyPolicy from './PrivacyPolicy'
import TermsAndConditions from './TermsAndConditions'

const HeroContent = () => {
  const navigate = useNavigate()
  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  return (
    <div className="w-full md:w-1/2 flex flex-col min-h-full gap-8 pt-6 pb-24">
      {/* Text */}
      <div className='space-y-4 md:space-y-6'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold font-roboto text-onboard_primary leading-tight'>
          Let's Create a software to
          <br />
          manage{' '}
          <span className='text-onboard_secondary'>
            your center
          </span>
        </h1>

        <p className='text-grey text-sm sm:text-base md:w-2/3'>
          Tell us a little about your fitness center and we'll recommend the
          best white-label software package for you.
        </p>
      </div>

      {/* CTA */}
      <div className='space-y-4 md:space-y-6 text-center md:text-left'>
        <h2 className='text-xl md:text-2xl text-onboard_primary'>
          Takes less than
          <span className='text-onboard_secondary font-bold text-3xl md:text-4xl'>
            {' '}2
          </span>
          {' '}minutes.
        </h2>

        <Button
          variant='onboard_default'
          size='landing'
          rightIcon={nextarrow}
          onClick={() => navigate('/type-selection')}
          className='w-full sm:w-auto'
        >
          Start
        </Button>
      </div>

      {/* Footer Links */}
      <div className='flex flex-wrap justify-center md:justify-start gap-4 text-xs sm:text-sm text-grey pt-4 border-t border-gray-200'>
        <button
          onClick={() => setTermsOpen(true)}
          className='hover:text-onboard_primary'
        >
          Terms & Conditions
        </button>

        <button
          onClick={() => setPrivacyOpen(true)}
          className='hover:text-onboard_primary'
        >
          Privacy Policy
        </button>
      </div>

      <TermsAndConditions
        setTermsOpen={setTermsOpen}
        termsOpen={termsOpen}
      />

      <PrivacyPolicy
        setPrivacyOpen={setPrivacyOpen}
        privacyOpen={privacyOpen}
      />
    </div>
  )
}

export default HeroContent