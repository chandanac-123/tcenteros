import Memberships from '@pages/billing/tab-modules/Memberships'
import Network from '@pages/billing/tab-modules/Networks'
import Overview from '@pages/billing/tab-modules/Overview'
import Reports from '@pages/billing/tab-modules/Reports'
import Sales from '@pages/billing/tab-modules/Sales'
import Settlements from '@pages/billing/tab-modules/Settlements'

export const billing_modules = [
  {
    id: 1,
    name: 'Overview',
    component: <Overview />
  },
  {
    id: 2,
    name: 'Sales',
    component: <Sales />
  },
  {
    id: 3,
    name: 'Memberships',
    component: <Memberships />
  },
  {
    id: 4,
    name: 'Network',
    component: <Network />
  },
  {
    id: 5,
    name: 'Settlements',
    component: <Settlements />
  },
  {
    id: 6,
    name: 'Reports',
    component: <Reports />
  }
]
