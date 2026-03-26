import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeVerticalSelect from '@common/components/CustomeVerticalSelect'
import { setting_tabs } from '@constants/settingsTabs'
import { useSettingsTabStore } from '@store/tabStore'
import { useEffect } from 'react'
import { routes } from '../../routes/Routes'

const Settings = () => {
  const { selectedTab, setSelectedTab, resetSelectedTab } =
    useSettingsTabStore()

  //  const routchekkc= routes.map((item, index) => {
  //       return item
  //   })
  //   console.log('routchekkc: ', routchekkc);

  // useEffect(() => {
  //   resetSelectedTab()
  // }, [resetSelectedTab])

  const selectedSettingsCategory = setting_tabs?.find(
    c => c?.id === selectedTab
  )
  // console.log('selectedTab: ', selectedTab)

  return (
    <ContentLayout>
      <span className='text-lg font-semibold text-textblack '>Settings</span>
      <CustomeVerticalSelect
        options={setting_tabs}
        selected={selectedTab}
        onSelect={setSelectedTab}
        heading={selectedSettingsCategory?.heading}
      >
        {selectedSettingsCategory?.component_view}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default Settings
