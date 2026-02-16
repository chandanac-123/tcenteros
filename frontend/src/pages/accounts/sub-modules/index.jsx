import expense from '@assets/account-modules/expense.svg'
import income from '@assets/account-modules/income.svg'
import inventory from '@assets/account-modules/inventory.svg'
import ledger from '@assets/account-modules/ledger.svg'
import overview from '@assets/account-modules/overview.svg'
import payroll from '@assets/account-modules/payroll.svg'
import settlement from '@assets/account-modules/settlement.svg'
import taxes from '@assets/account-modules/taxes.svg'

import expense_active from '@assets/account-modules/expense-active.svg'
import income_active from '@assets/account-modules/income-active.svg'
import inventory_active from '@assets/account-modules/inventory-active.svg'
import ledger_active from '@assets/account-modules/ledger-active.svg'
import overview_active from '@assets/account-modules/overview-active.svg'
import payrol_activel from '@assets/account-modules/payroll-active.svg'
import settlement_active from '@assets/account-modules/settlement-active.svg'
import taxes_active from '@assets/account-modules/taxes-active.svg'
import Overview from './Oveview'
import Ledger from './Ledger'
import Income from './Income'
import Expense from './Expense'
import Payroll from './Payroll'
import Inventory from './Inventory'
import Settlement from './Settlement'
import Taxes from './Taxes'
import ContentLayout from '@common/masterLayout/ContentLayout'
import { act, useState } from 'react'

const AccountsSubModules = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const subaccounts = [
    {
      title: 'Overview',
      image: overview,
      image_active: overview_active,
      active_bg_color: 'bg-overview_bg',
      component: <Overview />
    },
    {
      title: 'Ledger',
      image: ledger,
      image_active: ledger_active,
      active_bg_color: 'bg-plan_purple',
      component: <Ledger />
    },
    {
      title: 'Income',
      image: income,
      image_active: income_active,
      active_bg_color: 'bg-badge_blue',
      component: <Income />
    },
    {
      title: 'Expenses',
      image: expense,
      image_active: expense_active,
      active_bg_color: 'bg-green_text',
      component: <Expense />
    },
    {
      title: 'Payroll',
      image: payroll,
      image_active: payrol_activel,
      active_bg_color: 'bg-payroll_bg',
      component: <Payroll />
    },
    {
      title: 'Inventory',
      image: inventory,
      image_active: inventory_active,
      active_bg_color: 'bg-inventory_bg',
      component: <Inventory />
    },
    {
      title: 'Settlement',
      image: settlement,
      image_active: settlement_active,
      active_bg_color: 'bg-progress_yellow',
      component: <Settlement />
    },
    {
      title: 'Taxes',
      image: taxes,
      image_active: taxes_active,
      active_bg_color: 'bg-taxes_bg',
      component: <Taxes />
    }
  ]

  return (
    <ContentLayout>
      <div className='flex flex-col gap-6'>
        <span className='text-lg font-semibold text-textblack'>
          Accounts Sub Modules
        </span>

        {/* Tabs Container */}
        <div className='bg-white rounded-xl border border-gray-200 flex overflow-x-auto '>
          {subaccounts.map((item, index) => {
            const isActive = activeIndex === index

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  flex flex-col items-center justify-center
                  w-full
                  py-4 px-6
                  border-r border-gray-200 last:border-r-0
                  transition-all duration-200
                  ${
                    isActive
                      ? `${item.active_bg_color} text-white`
                      : 'bg-white hover:bg-gray-50'
                  }
                `}
              >
                <img
                  src={isActive ? item.image_active : item.image}
                  alt={item.title}
                  className='w-8 h-8 mb-2'
                />

                <span
                  className={`text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Module Content */}
        <div className='mt-4'>{subaccounts[activeIndex].component}</div>
      </div>
    </ContentLayout>
  )
}

export default AccountsSubModules
