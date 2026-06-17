import ChatBot from "@common/chatbot"

const PrimaryLayout = ({ children }) => {
  return (
    <div className='fixed inset-0 min-h-screen flex flex-col bg-primary-bg bg-cover bg-no-repeat bg-center'>
      {children}
      <div className="fixed bottom-8 right-6 z-[99999]">
        <ChatBot />
      </div>
    </div>
  )
}

export default PrimaryLayout
