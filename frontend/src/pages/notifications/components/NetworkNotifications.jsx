import { Button } from '@pages/components/ui/button'
import React from 'react'

const NetworkNotifications = () => {
  return (
    <div className='flex border border-tab_bg rounded-lg p-2'>
      <div className='flex flex-col w-full items-center gap-2'>
        <div className='flex justify-between w-full items-center'>
          <span className='text-md text-textblack font-semibold'>
            This is a network notification description.
          </span>
          <span className='text-xs text-textgrey'>2 hours ago</span>
        </div>

        <div className='flex justify-between w-full items-center'>
          <span className='text-xs text-textgrey'>
            This is a network notification description.
          </span>
          <div className='flex gap-2'>
            <Button size='notificationbutton' variant='outline_primary' className='text-xs'>
             Deny
            </Button>
             <Button size='notificationbutton' className='text-xs'>
              Approve  Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkNotifications
