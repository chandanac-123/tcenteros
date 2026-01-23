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
import eosdark from '@assets/images/eos-darkk.svg'
import excel from '@assets/images/excel-dark.svg'
import website from '@assets/images/web-dark.svg'
import eoslight from '@assets/images/eos-light.svg'
import excellight from '@assets/images/excel-light.svg'
import weblight from '@assets/images/web-light.svg'

const DegitalPresence = () => {
  const [selectedTools, setSelectedTools] = useState([])
  const [noneSelected, setNoneSelected] = useState(false)

  const toggleTool = tool => {
    setNoneSelected(false) // radio OFF
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  const selectNone = () => {
    setSelectedTools([]) // clear checkboxes
    setNoneSelected(true)
  }

  const tools = [
    {
      id: 'website',
      label: 'Website',
      dark: website,
      light: weblight
    },
    {
      id: 'excel',
      label: 'Excel / Manual record',
      dark: excel,
      light: excellight
    },
    {
      id: 'software',
      label: 'Another Management Software',
      dark: eosdark,
      light: eoslight
    }
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
        </div>
      </div>

      <div className='flex w-full px-4 sm:px-10 mt-10 justify-center'>
        <div className='flex flex-col gap-4 px-6 py-6 shadow-2xl rounded-lg w-full sm:w-2/3 lg:w-1/3'>
          <span className='text-center font-medium'>
            Do you already use any digital tools for your center?
          </span>

          {/* Option */}

          {tools.map(tool => {
            const isSelected = selectedTools.includes(tool.id)

            return (
              <label
                key={tool.id}
                onClick={() => toggleTool(tool.id)}
                className={`flex items-center border-2 rounded-lg px-4 py-3 cursor-pointer transition
        ${isSelected ? 'border-primary bg-primary/5' : 'border-bordergreylight'}
      `}
              >
                <img
                  src={isSelected ? tool.light : tool.dark}
                  alt={tool.label}
                  className='w-6 h-6 mr-3'
                />

                <span className='flex-1'>{tool.label}</span>

                <input
                  type='checkbox'
                  checked={isSelected}
                  readOnly
                  className='w-4 h-4'
                />
              </label>
            )
          })}

          <label
            onClick={selectNone}
            className={`flex items-center border-2 rounded-lg px-4 py-3 gap-4 cursor-pointer transition
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
export default DegitalPresence
