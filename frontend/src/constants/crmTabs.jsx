import Guest from '@pages/crm/Guest'
import Leads from '@pages/crm/Leads'
import Members from '@pages/crm/Members'
import Visitors from '@pages/crm/Visitors'

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
    id: 4,
    name: 'Guests',
    heading: 'Guests',
    component_view: <Guest />
  },
  {
    id: 3,
    name: 'Visitors',
    heading: 'Visitors',
    component_view: <Visitors />
  }
]
