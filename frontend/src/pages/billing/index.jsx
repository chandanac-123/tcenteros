import ContentLayout from '@common/masterLayout/ContentLayout'
import { useState } from 'react'
import CustomeTab from '@common/components/CustomeTab'
import { billing_modules } from '@constants/billing_module'

const Billing = () => {
  const [activeTab, setActiveTab] = useState('Overview')

  const activeModule = billing_modules.find(module => module.name === activeTab)

  return (
    <ContentLayout>
      <div className='w-full space-y-4'>
        <div className='text-xl font-semibold text-textblack mb-4'>
          Billing / {activeTab}
        </div>
        <CustomeTab
          tabList={billing_modules}
          value={activeTab}
          defaultVal='Overview'
          tabsListClass='p-[1px]'
          onChange={setActiveTab}
        />

        <div className='mt-4'>{activeModule?.component}</div>
      </div>
    </ContentLayout>
  )
}
export default Billing
