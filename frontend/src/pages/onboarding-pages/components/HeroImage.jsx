import LandingImage from '@assets/images/landingimg.svg'

const HeroImage = () => {
  return (
    <div className='w-full md:w-1/2 flex justify-center pb-2'>
      <img src={LandingImage} alt='Hero' className='max-w-md w-full' loading="lazy" />
    </div>
  )
}

export default HeroImage
