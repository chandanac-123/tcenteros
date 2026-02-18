import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeVerticalSelect from '@common/CustomeVerticalSelect'
import { useSettingsTabStore } from '@store/settingsTabStore'
import { setting_tabs } from '@constants/settingsTabs'

const Settings = () => {
  const selected = useSettingsTabStore(state => state.selectedTab)
  const setSelected = useSettingsTabStore(state => state.setSelectedTab)
  const selectedCategory = setting_tabs?.find(c => c?.id === selected)

  return (
    <ContentLayout>
      <span className='text-lg font-semibold text-textblack '>Settings</span>
      <CustomeVerticalSelect
        options={setting_tabs}
        selected={selected}
        onSelect={setSelected}
        heading={selectedCategory?.heading}
      >
        {selectedCategory?.component_view}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default Settings
