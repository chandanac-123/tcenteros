import ContentLayout from '@common/MasterLayout/ContentLayout'
import { inventory_modules } from '@constants/inventory_modules'
import CustomeTab from '@common/components/CustomeTab'
import { useInventoryStore } from '@store/networkTabstore'
import { useState } from 'react'

const Inventories = () => {
  const [activeTab, setActiveTab] = useState('overview')
  //  const { activeTab, setActiveTab } = useInventoryStore();
  // console.log("Active Store", activeTab);

  const activeModule = inventory_modules.find(
    module => module?.id === activeTab
  )
  // console.log("ActiveModule", activeModule);

  return (
    <ContentLayout>
      <div className='w-full space-y-4'>
        <div className='text-xl font-semibold text-textblack mb-4'>
          Inventory & Sales
        </div>
        <div className='overflow-x-auto scrollbar-hide'>
          <div className='min-w-max'>
            <CustomeTab
              tabList={inventory_modules}
              value={activeTab}
              defaultVal='overview'
              tabsListClass='p-[1px]'
              onChange={setActiveTab}
            />
          </div>
        </div>
        <div className='mt-4'>{activeModule?.component}</div>
      </div>
    </ContentLayout>
  )
}
export default Inventories
