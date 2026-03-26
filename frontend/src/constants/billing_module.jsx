import Memberships from '@pages/billing/tab-modules/Memberships'
import Network from '@pages/billing/tab-modules/network'
import Overview from '@pages/billing/tab-modules/Overview'
import Reports from '@pages/billing/tab-modules/Reports'
import Sales from '@pages/billing/tab-modules/Sales'
import Settlements from '@pages/billing/tab-modules/Settlements'

export const billing_modules = [
  {
    id: 'overview',
    name: 'Overview',
    component: <Overview />
  },
  {
    id: 'sales',
    name: 'Sales',
    component: <Sales />
  },
  {
    id: 'memberships',
    name: 'Memberships',
    component: <Memberships />
  },
  {
    id: 'network',
    name: 'Network',
    component: <Network />
  },
  {
    id: 'settlements',
    name: 'Settlements',
    component: <Settlements />
  },
  {
    id: 'reports',
    name: 'Reports',
    component: <Reports />
  }
]
