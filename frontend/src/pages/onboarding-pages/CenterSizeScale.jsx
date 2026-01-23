import { useState } from 'react'
import HexButton from '@pages/components/ui/hexbutton'

const CenterSize = () => {
  const [members, setMembers] = useState('50-150')
  const [trainers, setTrainers] = useState('3-5')

  return (
    <div className='space-y-8'>
      {/* Members */}
      <div className='text-center space-y-4'>
        <p className='font-medium'>
          How many active members do you currently have?
        </p>

        <div className='flex gap-4 justify-center flex-wrap'>
          {['1-50', '50-150', '150-500', '500+'].map(item => (
            <HexButton
              key={item}
              label={item}
              active={members === item}
              onClick={() => setMembers(item)}
            />
          ))}
        </div>
      </div>

      {/* Trainers */}
      <div className='text-center space-y-4'>
        <p className='font-medium'>
          How many trainers or instructors work with you?
        </p>

        <div className='flex gap-4 justify-center flex-wrap'>
          {['1-2', '3-5', '6-10', '10+'].map(item => (
            <HexButton
              key={item}
              label={item}
              active={trainers === item}
              onClick={() => setTrainers(item)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CenterSize
