import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Button } from '@pages/components/ui/button'
import { Input } from '@pages/components/ui/input'
import CustomeSelect from '@common/CustomeSelect'
import { Textarea } from '@pages/components/ui/textarea'
import tick from '@assets/form-icons/tick.svg'
import InputFile from '@common/CustomeFileUpload'
import CreatePlanFeature from './CreatePlanFeature'
import { useState } from 'react'

const CreateMembershipForm = () => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const membershipDurationOptions = [
    { id: 'month', name: 'Months' },
    { id: 'year', name: 'Years' }
  ]

  return (
    <ContentLayout>
      <div className='font-semibold text-2xl'>Membership Plans</div>
      <div className='text-lg font-medium my-4'>Create Membership Plan</div>

      <form className='space-y-2 w-3/4' id='membership-form'>
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

        <div className='flex justify-between items-end'>
          <div className='flex flex-col gap-4'>
            <span className='font-medium text-base text-textblack'>
              Create Plan Features
            </span>
            <div>
              <Button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleOpen();
                }}
                size='filterbutton'
                variant='button_outlined'
              >
                + Plan Features
              </Button>
            </div>

            <span className='font-medium text-base text-textblack'>
              Plan Features
            </span>
            <div className='flex gap-2 justify-center text-sm items-center'>
              <img src={tick} alt='Tick' className='w-3' />
              <span className='text-pricing_text font-normal'>
                Dedicated Nutrition App (iOS & Android)
              </span>
            </div>
          </div>

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
      <CreatePlanFeature
        setOpen={setOpen}
        open={open}
      />
    </ContentLayout>
  )
}
export default CreateMembershipForm
