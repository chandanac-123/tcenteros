import revenueicon from '@assets/billing/revenue.svg'
import payment from '@assets/billing/payment.svg'
import networkicon from '@assets/billing/network.svg'
import monthicon from '@assets/billing/month.svg'

const cardValue = [
  { title: '+ New Sale  ', value: '₹12,540', image: revenueicon },
  { title: '+ Renew  Membership  ', value: '₹8,320', image: payment },
  { title: '+ Add Charge ', value: '₹5,210', image: networkicon },
  { title: '+ Record Payment  ', value: '₹26,070', image: monthicon }
]

const DisplayActionCard = () => {
  return (
    <div className='flex flex-col gap-5 w-full justify-center items-center'>
      {cardValue.map((card, index) => (
        <div
          key={index}
          className='flex w-full  items-center gap-4 rounded-lg p-3 cursor-pointer shadow-xl transition'
        >
          <img src={card.image} alt={card.title} />
          <span className='text-base font-normal '>{card.title}</span>
        </div>
      ))}
    </div>
  )
}
export default DisplayActionCard
