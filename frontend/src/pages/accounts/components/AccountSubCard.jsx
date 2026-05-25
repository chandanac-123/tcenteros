import { subaccounts } from '@constants/accounts_submodules'
import { useNavigate } from 'react-router-dom'

const AccountSubCard = () => {
  const navigate = useNavigate()
  return (
    <div className='flex flex-wrap gap-4 w-full justify-center items-center'>
      {subaccounts.map(item => (
        <div
          onClick={() => navigate(`/accounts/sub-modules/${item.title.toLowerCase()}`)}
          key={item.title}
          className='flex flex-col cursor-pointer w-24 items-center gap-4 border border-tab_bg rounded-lg p-3 hover:shadow-sm transition'
        >
          <img src={item.image} alt={item.title} loading="lazy" />
          <span className='text-sm font-medium text-muted-foreground'>
            {item.title}
          </span>
        </div>
      ))}
    </div>
  )
}
export default AccountSubCard
