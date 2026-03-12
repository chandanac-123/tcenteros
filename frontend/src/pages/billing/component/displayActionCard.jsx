import new_sale from '@assets/billing/new-sale.svg'
import renew_membership from '@assets/billing/renew-membership.svg'
import add_charge from '@assets/billing/add-charge.svg'
import record_payment from '@assets/billing/record-payment.svg'

const cardValue = [
  { title: '+ New Sale', value: '₹12,540', image: new_sale },
  { title: '+ Renew  Membership', value: '₹8,320', image: renew_membership },
  { title: '+ Add Charge', value: '₹5,210', image: add_charge },
  // { title: '+ Record Payment', value: '₹26,070', image: record_payment }
]

const DisplayActionCard = ({onActionClick }) => {
  return (
    <div className='flex flex-col gap-5 w-full justify-center items-center'>
      {cardValue.map((card, index) => (
        <div
          key={index}
           onClick={() => onActionClick(card.title)}
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
