import StockActivity from '@pages/iventories/tab_modules/Stock_Activity'
import Overview from '@pages/iventories/tab_modules/Overview'
import Reports from '@pages/iventories/tab_modules/Reports'
import POS from '@pages/iventories/tab_modules/POS'
import Product from '@pages/iventories/tab_modules/Products'

export const inventory_modules = [
  {
    id: 'overview',
    name: 'Overview',
    component: <Overview />
  },
  {
    id: 'products',
    name: 'Products',
    component: <Product />
  },
  {
    id: 'stock_activity',
    name: 'Stock Activity',
    component: <StockActivity />
  },
  {
    id: 'pos',
    name: 'POS',
    component: <POS />
  },
  {
    id: 'reports',
    name: 'Reports',
    component: <Reports />
  }
]
