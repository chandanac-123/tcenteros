import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import logo from '@assets/images/logo.svg'
import { Progress } from '@pages/components/ui/progress'
import moveicon from '@assets/images/moveicon.svg'
import { Slider } from '@pages/components/ui/slider'
import yoga from '@assets/images/yoga.svg'
import dance from '@assets/images/dance.svg'
import gym from '@assets/images/gym.svg'
import zumba from '@assets/images/zumba.svg'
import crossfit from '@assets/images/crossfit.svg'
import elipes from '@assets/images/elipes.svg'

const TypeSelection = () => {
  return (
    <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center justify-between px-10 py-5 '>
        {/* Left Logo */}
        <div className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className=' w-auto' />
        </div>
      </header>

      {/* progress bar */}
      <div className='w-full gap-2 px-10'>
        <div className='flex justify-start items-center gap-2 mb-2'>
          <span className=' text-textgrey font-roboto font-semibold text-base'>
            Step 1 of 5
          </span>
          <img src={moveicon} alt='moveicon' className='w-5' />
        </div>
        <div className='w-1/3 gap-5 flex flex-col '>
          <div>
            {/* <Progress value={33} /> */}
            <Slider defaultValue={[33]} max={100} step={1} disabled />
          </div>
          <div className='text-secondary font-semibold text-2xl '>
            What kind of fitness center do you own ?
          </div>
          <div className='text-grey font-normal text-md '>
            Choose the type of fitness business type you own so we can recommend
            the best package for your needs.
          </div>
        </div>
      </div>

     <div className="relative inline-block">
  {/* Base image */}
  <img
    src={yoga}
    alt="TypeSelectionImage"
    className="w-auto border-dotted border-zinc-900 rounded-lg border-2 p-1"
  />

  {/* Top-right ellipse */}
  <img
    src={elipes}
    alt="ellipse"
    className="absolute top-2 right-2 w-6 h-6"
  />

  {/* Bottom label */}
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 border-green border-2 px-3 py-1 rounded-lg bg-white/5 backdrop-blur-md  text-sm">
    gym
  </div>
</div>

    </SecondaryLayout>
  )
}
export default TypeSelection
