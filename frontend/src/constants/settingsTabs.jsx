import CenterDesignations from '@pages/settings/CenterDesignations'
import CenterHolidays from '@pages/settings/CenterHolidays'
import CenterOperations from '@pages/settings/CenterOperation'
import TaxCategorySettings from '@pages/settings/TaxCategorySettings'

export const setting_tabs = [
  {
    id: 1,
    name: 'Tax Category Settings',
    heading: 'Create Tax Category',
    component_view: <TaxCategorySettings />
  },
  {
    id: 2,
    name: 'Center Operations',
    heading: 'Operational Settings',
    component_view: <CenterOperations />
  },

  {
    id: 4,
    name: 'Center Holidays',
    heading: 'Center Holidays',
    component_view: <CenterHolidays />
  },
  {
    id: 3,
    name: 'Centers Designation',
    heading: 'Center Designations',
    component_view: <CenterDesignations />
  }
]
