const SmartLayout = ({ children }) => {
  return (
    <div className='fixed inset-0 h-screen flex flex-col bg-smart-bg bg-cover bg-no-repeat bg-center'>
      {children}
    </div>
  )
}

export default SmartLayout
