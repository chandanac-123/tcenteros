const SmartLayout = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col bg-smart-bg bg-cover bg-no-repeat bg-center'>
      {children}
    </div>
  )
}

export default SmartLayout
