import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeVerticalSelect from '@common/components/CustomeVerticalSelect'
import { setting_tabs } from '@constants/settingsTabs'
import { useSettingsTabStore } from '@store/tabStore'

const Settings = () => {
  const { selectedTab, setSelectedTab, resetSelectedTab } =
    useSettingsTabStore()

  const selectedSettingsCategory = setting_tabs?.find(
    c => c?.id === selectedTab
  )

 return (
  <ContentLayout>
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-textblack">
        Settings
      </h1>

      <CustomeVerticalSelect
        options={setting_tabs}
        selected={selectedTab}
        onSelect={setSelectedTab}
        heading={selectedSettingsCategory?.heading}
      >
        {selectedSettingsCategory?.component_view}
      </CustomeVerticalSelect>
    </div>
  </ContentLayout>
);
}

export default Settings
