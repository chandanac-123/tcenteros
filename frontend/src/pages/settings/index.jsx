import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeVerticalSelect from '@common/CustomeVerticalSelect'
import { setting_tabs } from '@constants/settingsTabs'
import { useSettingsTabStore } from '@store/tabStore'

const Settings = () => {
  const {
    selectedTab: settingsSelectedTab,
    setSelectedTab: setSettingsSelectedTab
  } = useSettingsTabStore()
  const selectedSettingsCategory = setting_tabs?.find(
    c => c?.id === settingsSelectedTab
  )

  return (
    <ContentLayout>
      <span className='text-lg font-semibold text-textblack '>Settings</span>
      <CustomeVerticalSelect
        options={setting_tabs}
        selected={settingsSelectedTab}
        onSelect={setSettingsSelectedTab}
        heading={selectedSettingsCategory?.heading}
      >
        {selectedSettingsCategory?.component_view}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default Settings
