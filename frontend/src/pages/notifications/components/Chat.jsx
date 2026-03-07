import React from 'react'
import { Send } from 'lucide-react'

const messages = [
  {
    id: 1,
    sender: 'support',
    text: 'How can I help you today?',
    time: '09:00 AM'
  },
  {
    id: 2,
    sender: 'user',
    text: "Every time I click 'Join Session', the app takes me back to the Home screen instead of confirming my booking.",
    time: '09:03 AM'
  },
  {
    id: 3,
    sender: 'support',
    text: "Could you please provide me with some more details about the issue you're experiencing?",
    time: '09:00 AM'
  },
  {
    id: 4,
    sender: 'user',
    text: 'Sure',
    time: '09:03 AM'
  },
  {
    id: 5,
    sender: 'user',
    text: 'Whenever I try to view my workout history, the app freezes and crashes.',
    time: '09:03 AM'
  },
  {
    id: 6,
    sender: 'support',
    text: "I'm sorry to hear that. Let me check that for you. Have you tried restarting the app or your device to see if that resolves the issue?",
    time: '09:05 AM'
  }
]

const Chat = () => {
  return (
    <div className='flex flex-col h-full bg-primary/10 rounded-lg overflow-hidden'>
      {/* Chat messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'support' && (
              <img
                src='https://i.pravatar.cc/40'
                alt=''
                className='w-8 h-8 rounded-full mr-2'
              />
            )}

            <div className='max-w-[70%]'>
              <div
                className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-textwhite text-gray-800'
                }`}
              >
                {msg.text}
              </div>

              <div className='text-xs text-gray-500 mt-1'>{msg.time}</div>
            </div>

            {msg.sender === 'user' && (
              <img
                src='https://i.pravatar.cc/41'
                alt=''
                className='w-8 h-8 rounded-full ml-2'
              />
            )}
          </div>
        ))}
      </div>

      {/* Chat input */}
      <div className='p-3 bg-primary flex items-center gap-2'>
        <input
          type='text'
          placeholder='Write Here...'
          className='flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none'
        />

        <button className='bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full'>
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default Chat
