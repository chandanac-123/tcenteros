import { Tabs, TabsList, TabsTrigger } from '@pages/components/ui/tabs'

const CustomeTab = ({ tabList, defaultVal, tabsListClass = '', tabsTriggerClass = '', tabsClass = '', onChange }) => {
  // Reusable styling via props
  return (
    <Tabs defaultValue={defaultVal} className={`mr-2 ${tabsClass}`} onValueChange={onChange} >
      <TabsList className={tabsListClass} >
        {tabList.map(tab => (
          <TabsTrigger key={tab.id} value={tab.name} className={tabsTriggerClass}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default CustomeTab
