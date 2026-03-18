import revenueicon from '@assets/billing/revenue.svg'
import payment from '@assets/billing/payment.svg'
import networkicon from '@assets/billing/network.svg'
import monthicon from '@assets/billing/month.svg'

const StatusDisplayCard = ({ data }) => {

    const cardValue = [
    {
      title: 'Today Revenue',
      value: data?.total_revenue,
      image: revenueicon
    },
    {
      title: 'Pending Payments',
      value: data?.pending_payments,
      image: payment
    },
    {
      title: 'Network Earnings',
      value: data?.network_earnings,
      image: networkicon
    },
    {
      title: 'This Month Total',
      value: data?.this_month_total,
      image: monthicon
    }
  ]
  return (
    <div className='w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cardValue.map((card, index) => (
        <div
          key={index}
          className='flex items-center gap-4 border border-tab_bg 
                     rounded-lg p-4 cursor-pointer  shadow-primary-shadow
                     bg-white'
        >
          <img
            src={card.image}
            alt={card.title}
            className='w-10 h-10 object-contain'
          />
          <div className='flex flex-col'>
            <span className='text-xs text-gray-500'>{card.title}</span>
            <span className='text-lg font-semibold text-textblack'>
              {card.value ? `₹ ${card.value}` : '₹ 0'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
export default StatusDisplayCard
