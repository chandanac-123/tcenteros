import expense from '@assets/account-modules/expense.svg'
import income from '@assets/account-modules/income.svg'
import inventory from '@assets/account-modules/inventory.svg'
import ledger from '@assets/account-modules/ledger.svg'
import overview from '@assets/account-modules/overview.svg'
import payroll from '@assets/account-modules/payroll.svg'
import settlement from '@assets/account-modules/settlement.svg'
import taxes from '@assets/account-modules/taxes.svg'

const AccountSubCard = () => {
  const subaccounts = [
    { title: 'Overview', image: overview },
    { title: 'Ledger', image: ledger },
    { title: 'Income', image: income },
    { title: 'Expenses', image: expense },
    { title: 'Payroll', image: payroll },
    { title: 'Inventory', image: inventory },
    { title: 'Settlement', image: settlement },
    { title: 'Taxes', image: taxes }
  ]

  return (
    <div className='flex flex-wrap gap-4 w-full justify-center items-center'>
      {subaccounts.map(item => (
        <div
          key={item.title}
          className='flex flex-col w-24 items-center gap-4 border border-tab_bg rounded-lg p-3 hover:shadow-sm transition'
        >
          <img src={item.image} alt={item.title} />
          <span className='text-sm font-medium text-muted-foreground'>
            {item.title}
          </span>
        </div>
      ))}
    </div>
  )
}
export default AccountSubCard
