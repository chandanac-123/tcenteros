const SecondaryLayout = ({ children }) => {
  return (
    <div className='fixed inset-0 min-h-screen flex flex-col bg-secondary-bg bg-cover bg-no-repeat bg-center overflow-x-auto'>
      {children}
    </div>
  )
}

export default SecondaryLayout
