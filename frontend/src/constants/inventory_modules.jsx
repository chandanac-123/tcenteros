import StockActivity from '@pages/iventories/tab_modules/Stock_Activity'
import ReceiveStock from '@pages/iventories/tab_modules/Receive_Stock'
import Overview from '@pages/iventories/tab_modules/Overview'
import Reports from '@pages/iventories/tab_modules/Reports'
import POS from '@pages/iventories/tab_modules/POS'
import Product from '@pages/iventories/tab_modules/Products'

export const inventory_modules = [
  {
    id: 1,
    name: 'Overview',
    component: <Overview />
  },
  {
    id: 2,
    name: 'Products',
    component: <Product />
  },
  {
    id: 3,
    name: 'Receive Stock',
    component: <ReceiveStock />
  },
  {
    id: 4,
    name: 'Stock Activity',
    component: <StockActivity />
  },
  {
    id: 5,
    name: 'POS',
    component: <POS />
  },
  {
    id: 6,
    name: 'Reports',
    component: <Reports />
  }
]
