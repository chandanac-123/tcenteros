import StockActivity from '@pages/iventories/tab_modules/Stock_Activity'
import ReceiveStock from '@pages/iventories/tab_modules/Receive_Stock'
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
    id: 'receive_stock',
    name: 'Receive Stock',
    component: <ReceiveStock />
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
