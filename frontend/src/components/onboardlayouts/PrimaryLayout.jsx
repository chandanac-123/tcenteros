const PrimaryLayout = ({ children }) => {
  return (
    <div className='min-h-screen flex flex-col bg-primary-bg bg-cover bg-no-repeat bg-center'>
      {children}
    </div>
  )
}

export default PrimaryLayout
