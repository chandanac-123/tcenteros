import ContentLayout from "@common/masterLayout/ContentLayout"
import { inventory_modules } from "@constants/inventory_modules"
import CustomeTab from "@common/components/CustomeTab";
import { useInventoryStore } from "@store/networkTabstore";

const Inventories = () => {
  const { activeTab, setActiveTab } = useInventoryStore();

  // console.log("Active Store", activeTab);


  const activeModule = inventory_modules.find(module => module.name === activeTab)
  // console.log("ActiveModule", activeModule);



  return (
    <ContentLayout>
      <div className='w-full space-y-4'>
        <div className='text-xl font-semibold text-textblack mb-4'>
          Inventory & Sales
        </div>
        <CustomeTab
          tabList={inventory_modules}
          defaultVal={activeTab}
          tabsListClass='p-[1px]'
          onChange={setActiveTab}
        />
        <div className='mt-4'>{activeModule?.component}</div>
      </div>
    </ContentLayout>
  )
}
export default Inventories