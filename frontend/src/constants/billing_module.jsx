import Memberships from '@pages/billing/component/Memberships'
import Network from '@pages/billing/component/Networks'
import Overview from '@pages/billing/component/Overview'
import Reports from '@pages/billing/component/Reports'
import Sales from '@pages/billing/component/Sales'
import Settlements from '@pages/billing/component/Settlements'

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
