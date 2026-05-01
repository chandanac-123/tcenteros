import ContentLayout from '@common/MasterLayout/ContentLayout'
import { useState } from 'react'
import CustomeTab from '@common/components/CustomeTab'
import NetworkNotifications from './components/NetworkNotifications'
import CenterNotifications from './components/CenterNotifications'
import Tickets from './components/Tickets'
import { useAuthStore } from '@store/authStore'

const tabs = [
  { id: 'network', name: 'Network' },
  { id: 'center', name: 'Center' },
  { id: 'tickets', name: 'Tickets' }
]

const Notifications = () => {
  const role = useAuthStore((state) => state.auth?.role)
  const isSuperAdmin = role === "superadmin"

  const [activeTab, setActiveTab] = useState('network')

  return (
    <ContentLayout>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col'>
          <span className='flex text-lg font-semibold'>Notification</span>
          <span className='flex text-sm text-textgrey'>
            You have 12 new notification
          </span>
        </div>

        {/*  Show tabs ONLY if not superadmin */}
        {!isSuperAdmin && (
          <div className='flex w-auto'>
            <CustomeTab
              tabList={tabs}
              defaultVal='network'
              tabsListClass=' w-[400px] p-[1px]'
              onChange={(value) => setActiveTab(value)}
            />
          </div>
        )}

        {/*  Superadmin: Directly show Tickets */}
        {isSuperAdmin ? (
          <Tickets />
        ) : (
          <>
            {activeTab === 'network' && <NetworkNotifications />}
            {activeTab === 'center' && <CenterNotifications />}
            {activeTab === 'tickets' && <Tickets />}
          </>
        )}
      </div>
    </ContentLayout>
  )
}

export default Notifications