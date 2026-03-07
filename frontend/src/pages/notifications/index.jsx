import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useState } from 'react'
import CustomeTab from '@common/CustomeTab'
import NetworkNotifications from './components/NetworkNotifications'
import CenterNotifications from './components/CenterNotifications'
import Tickets from './components/Tickets'

const employeeOrMember = [
  { id: 1, name: 'All' },
  { id: 2, name: 'Network' },
  { id: 3, name: 'Center' },
  { id: 4, name: 'Tickets' }
]

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('All')

  return (
    <ContentLayout>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col'>
          <span className='flex text-lg font-semibold'>Notification</span>
          <span className='flex text-sm text-textgrey'>
            You have 12 new notification
          </span>
        </div>

        <div className='flex w-auto'>
          <CustomeTab
            tabList={employeeOrMember}
            defaultVal='All'
            tabsListClass=' w-[400px] p-[1px]'
            onChange={value => setActiveTab(value)}
          />
        </div>

        {/* Tab Content */}

        {activeTab === 'All' && (
          <>
            <NetworkNotifications />
            <CenterNotifications />
          </>
        )}

        {activeTab === 'Network' && <NetworkNotifications />}

        {activeTab === 'Center' && <CenterNotifications />}

        {activeTab === 'Tickets' && <Tickets />}
      </div>
    </ContentLayout>
  )
}

export default Notifications
