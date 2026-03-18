import Guest from '@pages/crm/guest'
import Leads from '@pages/crm/leads'
import Members from '@pages/crm/member'
import Visitors from '@pages/crm/visitor'

export const crm_tabs = [
  {
    id: 1,
    name: 'Members',
    heading: 'Members',
    component_view: <Members/>
  },
  {
    id: 2,
    name: 'Leads',
    heading: 'Leads',
    component_view: <Leads/>
  },

  {
    id: 3,
    name: 'Guests',
    heading: 'Guests',
    component_view: <Guest />
  },
  {
    id: 4,
    name: 'Visitors',
    heading: 'Visitors',
    component_view: <Visitors />
  }
]
