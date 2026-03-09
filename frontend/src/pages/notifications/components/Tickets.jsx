import { Button } from '@pages/components/ui/button'
import Chat from './Chat'
import { useState } from 'react'
import { useAllTicketsQuery } from '@api-queries/notifictaions/Query'

const Tickets = () => {
  const [openChat, setOpenChat] = useState(false)
  const {data: tickets, isLoading, isError}=useAllTicketsQuery()
  console.log('tickets: ', tickets);

  return (
    <>
     
      {!openChat && (
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
                <Button
                  size='notificationbutton'
                  className='text-xs'
                  onClick={() => setOpenChat(true)}
                >
                  Open
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openChat && (
        <div className='mt-4 h-[500px]'>
          <Chat />
        </div>
      )}
    </>
  )
}

export default Tickets
