import CenterDesignations from '@pages/settings/CenterDesignations'
import CenterHolidays from '@pages/settings/CenterHolidays'
import CenterOperations from '@pages/settings/CenterOperation'
import GalleryUpload from '@pages/settings/GalleryUpload'
import ProductCategory from '@pages/settings/ProductCategory'
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
    name: ' Operations',
    heading: '',
    component_view: <CenterOperations />
  },

  {
    id: 4,
    name: ' Holidays',
    heading: '',
    component_view: <CenterHolidays />
  },
  {
    id: 3,
    name: ' Designation',
    heading: '',
    component_view: <CenterDesignations />
  },
  {
    id: 5,
    name: 'Gallery image upload',
    heading: '',
    component_view: <GalleryUpload />
  },
  {
    id: 6,
    name: 'Product Category',
    heading: '',
    component_view: <ProductCategory/>
  }
]
