import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Textarea } from '@pages/components/ui/textarea'
import tick from '@assets/form-icons/tick.svg'
import InputFile from '@common/CustomeFileUpload'
import CreatePlanFeature from './CreatePlanFeature'
import { useState } from 'react'
import CustomeModal from '@common/CustomeModal'

const CreateMembershipForm = ({ open, setOpen }) => {
  const [featureOpen, setFeatureOpen] = useState(false)

  const handleOpen = () => {
    setFeatureOpen(true)
  }

  const membershipDurationOptions = [
    { id: 'month', name: 'Months' },
    { id: 'year', name: 'Years' }
  ]

  return (
    <>
      <CustomeModal
        open={open}
        onOpenChange={setOpen}
        header='Create Membership Plan'
      >
        <form className='space-y-2 w-full' id='membership-form'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Membership Name'
                name='name'
                placeholder='Enter Your Full Name'
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <span className='text-sm font-normal text-textblack'>
                Set Membership Duration
              </span>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <Input type='number' label='' name='email' placeholder='' />
                </div>
                <div className='flex-1'>
                  <CustomeSelect options={membershipDurationOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-4'>
            <div className='flex-1'>
              <Input
                label='Package Price'
                name='price'
                placeholder='Enter Package Price'
              />
            </div>
            <div className='flex-1'>
              <InputFile label='Upload Image ' />
            </div>
          </div>
          <div>
            <Textarea
              label='Description'
              name='description'
              placeholder='Enter Description'
            />
          </div>

          <div className='flex flex-col gap-4 mt-4'>
            <span className='font-medium text-base text-textblack'>
              Create Plan Features
            </span>

            <span className='font-medium text-base text-textblack'>
              Plan Features
            </span>
            <div className='flex gap-2 border rounded-lg p-2 text-sm'>
              <img src={tick} alt='Tick' className='w-3' />
              <span className='text-pricing_text font-normal'>
                Dedicated Nutrition App (iOS & Android)
              </span>
            </div>

            <Button
              type='button'
              onClick={e => {
                e.stopPropagation()
                handleOpen()
              }}
              size='filterbutton'
              variant='button_outlined_textleft'
            >
              + Plan Features
            </Button>

            <div className='self-end'>
              <Button
                id='membership-form'
                size='addbutton'
                variant='default'
                type='submit'
              >
                Create Plan
              </Button>
            </div>
          </div>
        </form>
      </CustomeModal>
      <CreatePlanFeature setOpen={setFeatureOpen} open={featureOpen} />
    </>
  )
}
export default CreateMembershipForm
