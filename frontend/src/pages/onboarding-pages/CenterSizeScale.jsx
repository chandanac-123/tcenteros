import { useState } from 'react'
import SecondaryLayout from '@components/onboardlayouts/SecondaryLayout'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import HexOptionGroup from './components/HexOptionGroup'
import { memberOptions, trainerOptions } from '@constants/centerSizeOption'

const CenterSize = () => {
  const [members, setMembers] = useState('50-150')
  const [trainers, setTrainers] = useState('3-5')

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        total={5}
        value={60}
        title='Do you already use any digital tools for your center?'
      />
      <HexOptionGroup
        title='How many active members do you currently have?'
        options={memberOptions}
        value={members}
        onChange={setMembers}
      />

      <HexOptionGroup
        title='How many trainers or instructors work with you?'
        options={trainerOptions}
        value={trainers}
        onChange={setTrainers}
      />
    </SecondaryLayout>
  )
}

export default CenterSize
