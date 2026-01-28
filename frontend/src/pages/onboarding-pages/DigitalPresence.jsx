import SecondaryLayout from '@common/onboardlayouts/SecondaryLayout'
import { useState } from 'react'
import { Button } from '@pages/components/ui/button'
import rightcolorarrow from '@assets/images/rightcolorarrow.svg'
import backarrow from '@assets/images/backarrow.svg'
import OnboardHeader from './components/OnboardHeader'
import OnboardProgress from './components/OnboardProgress'
import ToolOption from './components/ToolOption'
import { digitalTools } from '@constants/digitalTools'

const DegitalPresence = () => {
  const [selectedTools, setSelectedTools] = useState([])
  const [noneSelected, setNoneSelected] = useState(false)

  const toggleTool = toolId => {
    setNoneSelected(false)
    setSelectedTools(prev =>
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    )
  }

  const selectNone = () => {
    setSelectedTools([])
    setNoneSelected(true)
  }

  return (
    <SecondaryLayout>
      <OnboardHeader />

      <OnboardProgress
        step={1}
        total={5}
        value={80}
        title=''
      />

      <div className='flex justify-center px-4 sm:px-10'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-[0_4px_24px_0_rgba(0,0,0,0.15)] rounded-3xl w-full sm:w-2/3 lg:w-1/3'>
        <span>Do you already use any digital tools for your center?</span>

          {digitalTools.map(tool => (
            <ToolOption
              key={tool.id}
              tool={tool}
              selected={selectedTools.includes(tool.id)}
              onToggle={toggleTool}
            />
          ))}

          {/* None option */}
          <label
            onClick={selectNone}
            className={`
              flex items-center border-2 rounded-lg px-4 py-3 gap-4 cursor-pointer transition
              ${noneSelected ? 'border-primary bg-primary/5' : 'border-grey'}
            `}
          >
            <input
              type='radio'
              checked={noneSelected}
              readOnly
              className='w-5 h-5'
            />
            <span className='flex-1'>None of the above</span>
          </label>
        </div>
      </div>

      <div className='mt-auto flex justify-between px-4 sm:px-10 pb-6 sm:pb-8'>
        <Button variant='outline_secondary' size='sm' leftIcon={backarrow}>
          Back
        </Button>
        <Button variant='outline_primary' rightIcon={rightcolorarrow}>
          Next
        </Button>
      </div>
    </SecondaryLayout>
  )
}

export default DegitalPresence
