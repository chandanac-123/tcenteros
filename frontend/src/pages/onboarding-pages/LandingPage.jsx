import PrimaryLayout from '@components/onboardlayouts/PrimaryLayout'
import HeroContent from './components/HeroContent'
import HeroImage from './components/HeroImage'
import Header from './components/Header'

const Landing = () => {
  return (
    <PrimaryLayout>
      <Header />

      <main className='flex flex-1 flex-col md:flex-row px-4 sm:px-10 lg:px-20 items-center gap-10'>
        <HeroContent />
        <HeroImage />
      </main>
    </PrimaryLayout>
  )
}

export default Landing
