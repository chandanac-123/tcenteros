import React from 'react'
import { Send } from 'lucide-react'
import { useFormik } from 'formik'
import {
  useTicketByIdQuery,
  useSendMessageMutation
} from '@api-queries/notifictaions/Query'

const Chat = ({ ticketId }) => {
  const { data, isFetching } = useTicketByIdQuery(ticketId)

  const { mutateAsync: sendMessageMutation, isPending } =
    useSendMessageMutation()

  const formik = useFormik({
    initialValues: {
      message: ''
    },
    onSubmit: async values => {
      if (!values.message.trim()) return

      try {
        const formData = new FormData()
        formData.append('message', values.message)

        await sendMessageMutation({
          id: ticketId,
          data: formData
        })

        formik.resetForm()
      } catch (error) {
        console.error(error)
      }
    }
  })

  const messages = data?.messages || []

  return (
    <div className='flex flex-col bg-primary/10 rounded-lg overflow-hidden h-full'>
      {/* Messages */}
      <div className='flex-1 overflow-y-auto p-3 space-y-2'>
        {messages.map(msg => {
          const isUser = msg.sender_role !== 'superadmin'

          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <img
                  src='https://i.pravatar.cc/40'
                  alt=''
                  className='w-8 h-8 rounded-full mr-2'
                />
              )}

              <div className='max-w-[70%]'>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-primary to-secondary text-white'
                      : 'bg-textwhite text-gray-800'
                  }`}
                >
                  {msg.message}
                </div>

                <div className='text-xs text-gray-500 mt-1'>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              </div>

              {isUser && (
                <img
                  src='https://i.pravatar.cc/41'
                  alt=''
                  className='w-8 h-8 rounded-full ml-2'
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={formik.handleSubmit}
        className='p-3 bg-primary flex items-center gap-2'
      >
        <input
          type='text'
          name='message'
          placeholder='Write here...'
          value={formik.values.message}
          onChange={formik.handleChange}
          className='flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none'
        />

        <button
          type='submit'
          disabled={isPending}
          className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full'
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}

export default Chat
