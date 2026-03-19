import PrimaryLayout from '@common/onboardlayouts/PrimaryLayout'
import HeroContent from './components/HeroContent'
import HeroImage from './components/HeroImage'
import Header from './components/Header'

const Landing = () => {
  return (
    <PrimaryLayout>
      <Header />
      <main
        className='
          flex flex-1 flex-col-reverse md:flex-row
          px-4 sm:px-6 md:px-10 lg:px-20
          items-center justify-center
          gap-8 md:gap-10 lg:gap-16
          w-full max-w-7xl mx-auto
        '
      >
        <HeroContent />
        <HeroImage />
      </main>
    </PrimaryLayout>
  )
}

export default Landing
