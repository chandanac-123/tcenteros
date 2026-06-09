import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useState } from 'react'
import CustomeTab from '@common/components/CustomeTab'
import { billing_modules } from '@constants/billing_module'

const Billing = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const activeModule = billing_modules.find(module => module?.id === activeTab)

  return (
    <ContentLayout>
      <div className='w-full space-y-4'>
        <div className='text-xl font-semibold text-textblack mb-4'>
          Billing / {activeTab}
        </div>
        <div className='overflow-x-auto scrollbar-hide'>
          <div className='min-w-max'>
            <CustomeTab
              tabList={billing_modules}
              value={activeTab}
              defaultVal='overview'
              tabsListClass='p-[1px]'
              onChange={setActiveTab}
            />
          </div></div>
        <div className='mt-4'>{activeModule?.component}</div>
      </div>
    </ContentLayout>
  )
}
export default Billing
