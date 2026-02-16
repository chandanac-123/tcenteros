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
import Overview from '@pages/accounts/sub-modules/Oveview'
import Ledger from '@pages/accounts/sub-modules/Ledger'
import Income from '@pages/accounts/sub-modules/Income'
import Expense from '@pages/accounts/sub-modules/Expense'
import Payroll from '@pages/accounts/sub-modules/Payroll'
import Inventory from '@pages/accounts/sub-modules/Inventory'
import Settlement from '@pages/accounts/sub-modules/Settlement'
import Taxes from '@pages/accounts/sub-modules/Taxes'


export const subaccounts = [
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
