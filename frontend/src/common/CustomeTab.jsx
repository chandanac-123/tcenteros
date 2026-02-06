import { Tabs, TabsList, TabsTrigger } from '@pages/components/ui/tabs'

const CustomeTab = ({ tabList, defaultVal }) => {
  // Find the Employee tab name for defaultValue
  return (
    <Tabs defaultValue={defaultVal} className='mr-2'>
      <TabsList>
        {tabList.map(tab => (
          <TabsTrigger key={tab.id} value={tab.name}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default CustomeTab
