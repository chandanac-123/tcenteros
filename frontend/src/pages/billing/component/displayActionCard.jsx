import new_sale from '@assets/billing/new-sale.svg'
import renew_membership from '@assets/billing/renew-membership.svg'
import add_charge from '@assets/billing/add-charge.svg'
import record_payment from '@assets/billing/record-payment.svg'

const cardValue = [
  { title: '+ New Sale', value: '₹12,540', image: new_sale },
  // { title: '+ Renew  Membership', value: '₹8,320', image: renew_membership },
  { title: '+ Add Charge', value: '₹5,210', image: add_charge }
  // { title: '+ Record Payment', value: '₹26,070', image: record_payment }
]

const DisplayActionCard = ({ onActionClick }) => {
  return (
    <div className='flex gap-2 w-auto justify-center items-center'>
      {cardValue.map((card, index) => (
        <div
          key={index}
          onClick={() => onActionClick(card.title)}
          className='flex w-full items-center gap-2 rounded-lg py-2 px-4 cursor-pointer  shadow-xl transition'
        >
          <img src={card.image} alt={card.title} />
          <span className='text-base font-normal whitespace-nowrap'>
            {card.title}
          </span>
        </div>
      ))}
    </div>
  )
}
export default DisplayActionCard
