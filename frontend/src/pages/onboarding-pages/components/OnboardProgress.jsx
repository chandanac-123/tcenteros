import moveicon from '@assets/navigate-icons/moveicon.svg'
import { Slider } from '@pages/components/ui/slider'

const OnboardProgress = ({
  step = 1,
  total = 5,
  value = 33,
  title,
  description
}) => {
  return (
    <div className='px-10'>
      <div className='flex items-center gap-4 mb-2'>
        <span className='text-textgrey font-semibold'>
          Step {step} of {total}
        </span>
        <img src={moveicon} alt='icon' className='w-5' loading="lazy" />
      </div>

      <div className='w-full sm:w-2/3 lg:w-1/3 flex flex-col gap-3'>
        <Slider defaultValue={[value]} max={100} disabled />

        <h2 className='text-onboard_secondary font-semibold text-xl sm:text-2xl'>
          {title}
        </h2>

        <p className='text-grey text-sm sm:text-md'>{description}</p>
      </div>
    </div>
  )
}

export default OnboardProgress
