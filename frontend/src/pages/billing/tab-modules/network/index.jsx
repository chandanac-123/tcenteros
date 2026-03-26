import CustomeTab from '@common/components/CustomeTab'
import IncomingNetwork from './IncomingNetwork'
import OutgoingNetwork from './OutgoingNetwork'
import { useState } from 'react'

const networkType = [
  { id: 'incoming', name: 'Incoming Network', component: <IncomingNetwork /> },
  { id: 'outgoing', name: 'Outgoing Network', component: <OutgoingNetwork /> }
]

const Network = () => {
  const [activeTab, setActiveTab] = useState('incoming')

  const activeModule = networkType.find(item => item.id === activeTab)

  return (
    <div className='gap-4 flex flex-col'>
      <div className='flex w-60'>
        <CustomeTab
          tabList={networkType}
          value={activeTab}
          defaultVal='incoming'
          tabsListClass='p-[1px]'
          onChange={setActiveTab}
        />
      </div>

      <div>{activeModule?.component}</div>
    </div>
  )
}

export default Network
