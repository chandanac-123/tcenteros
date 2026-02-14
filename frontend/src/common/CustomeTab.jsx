import { Tabs, TabsList, TabsTrigger } from '@pages/components/ui/tabs'

const CustomeTab = ({ tabList, defaultVal, tabsListClass = '', tabsTriggerClass = '', tabsClass = '', onChange }) => {
  // Reusable styling via props
  return (
    <Tabs defaultValue={String(defaultVal)} className={`mr-2 ${tabsClass}`} onValueChange={val => onChange?.(Number(val))}>
      <TabsList className={tabsListClass}>
        {tabList.map(tab => (
          <TabsTrigger key={tab.id} value={String(tab.id)}  className={tabsTriggerClass}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export default CustomeTab
