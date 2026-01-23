import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import logo from '@assets/images/logo.svg'
import moveicon from '@assets/images/moveicon.svg'
import { Slider } from '@pages/components/ui/slider'
import elipes from '@assets/images/elipes.svg'
import selection from '@assets/images/selected.svg'
import { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import inperson from '@assets/images/inperson.svg'
import hybrid from '@assets/images/hybrid.svg'
import backarrow from '@assets/images/backarrow.svg'

const ClassSelectionMode = () => {
  const [selectedType, setSelectedType] = useState('dance') // default selected

  const fitnessTypes = [
    { id: 'in-person', label: 'In-Person', image: inperson },
    { id: 'hybrid', label: 'Hybrid', image: hybrid },
  ]

  return (
    <SecondaryLayout>
      {/* Header */}
      <header className='flex items-center justify-between px-4 sm:px-10 py-5 '>
        {/* Left Logo */}
        <div className='flex items-center gap-2'>
          <img src={logo} alt='Logo' className=' w-auto' />
        </div>
      </header>

      {/* progress bar */}
      <div className='w-full gap-2 px-10'>
        <div className='flex justify-start items-center gap-4 mb-2'>
          <span className=' text-textgrey font-roboto font-semibold text-base'>
            Step 1 of 5
          </span>
          <img src={moveicon} alt='moveicon' className='w-5' />
        </div>
        <div className='w-full sm:w-2/3 lg:w-1/3 gap-5 flex flex-col '>
          <div>
            {/* <Progress value={33} /> */}
            <Slider defaultValue={[33]} max={100} step={1} disabled />
          </div>
          <div className='text-secondary font-semibold text-xl sm:text-2xl '>
            What kind of fitness center do you own ?
          </div>
          <div className='text-grey font-normal  text-sm sm:text-md'>
            Choose the type of fitness business type you own so we can recommend
            the best package for your needs.
          </div>
        </div>
      </div>

      <div className='flex gap-4 px-4 sm:px-10 mt-10 flex-wrap lg:flex-nowrap justify-center'>
        {fitnessTypes.map(item => {
          const isSelected = selectedType === item.id

          return (
            <div
              key={item.id}
              onClick={() => setSelectedType(item.id)}
              className={`
          relative cursor-pointer transition-all duration-300
          rounded-xl border-2 p-1
          ${
            isSelected
              ? 'scale-110 shadow-xl'
              : 'border-bordergrey border-dotted'
          }
        `}
            >
              {/* Base image */}
              <img
                src={item.image}
                alt={item.label}
                className='w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] lg:w-[222px] lg:h-[220px] object-cover rounded-lg'
              />

              {/* Top-right icon */}
              <div className='absolute top-3 right-3'>
                {isSelected ? (
                  <img src={selection} alt='selected' className='w-6 h-6' />
                ) : (
                  <img src={elipes} alt='ellipse' className='w-6 h-6' />
                )}
              </div>

              {/* Bottom label */}
              <div className=' absolute bottom-3 left-1/2 -translate-x-1/2  w-5/6 px-2 py-1 rounded-xl text-center backdrop-blur-sm bg-black/30 text-white'>
                {item.label}
              </div>
            </div>
          )
        })}
      </div>
      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
         <Button
          variant='outline_secondary'
          size='sm'
          leftIcon={backarrow}
        >
          Back
        </Button>
        <Button
          variant='outline_primary'
          size='default'
          rightIcon={rightcolorarrow}
        >
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}
export default ClassSelectionMode
