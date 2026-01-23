const SecondaryLayout = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col bg-secondary-bg bg-cover bg-no-repeat bg-center'>
      {children}
    </div>
  )
}

export default SecondaryLayout
