import { Button } from '@pages/components/ui/button'
import Chat from './Chat'
import { useState } from 'react'
import { useAllTicketsQuery } from '@api-queries/notifictaions/Query'
import CloseTicket from './TicketClose'

const Tickets = () => {
  const [openChat, setOpenChat] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [ticketClose, setTicketClose] = useState(false)
  const { data: tickets, isLoading } = useAllTicketsQuery()

  if (isLoading) return <p>Loading...</p>

  return (
    <>
      {!openChat &&
        tickets?.map(ticket => (
          <div
            key={ticket.id}
            className='flex border border-tab_bg rounded-lg p-3 mb-3'
          >
            <div className='flex flex-col w-full gap-2'>
              <div className='flex justify-between w-full'>
                <span className='text-md text-textblack font-semibold'>
                  {ticket.subject}
                </span>

                <span className='text-xs text-textgrey'>
                  {new Date(ticket.created_at).toLocaleString()}
                </span>
              </div>

              <div className='flex justify-between w-full items-center'>
                <span className='text-xs text-textgrey'>
                  {ticket.description}
                </span>

                <div className='flex gap-2'>
                  <Button
                    variant='outline_primary'
                    size='notificationbutton'
                    className='text-xs'
                    disabled={ticket?.status === 'closed'}
                    onClick={() => {
                      setSelectedTicket(ticket.id)
                      setTicketClose(true)
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    size='notificationbutton'
                    className='text-xs'
                    onClick={() => {
                      setSelectedTicket(ticket.id)
                      setOpenChat(true)
                    }}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

      {openChat && (
        <div className='mt-4 h-[500px]'>
          <Chat ticketId={selectedTicket} />
        </div>
      )}
      <CloseTicket
        open={ticketClose}
        setOpen={setTicketClose}
        id={selectedTicket}
      />
    </>
  )
}

export default Tickets
