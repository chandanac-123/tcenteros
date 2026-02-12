import CustomeVerticalSelect from '@common/CustomeVerticalSelect'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { crm_tabs } from '@constants/crmTabs'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/crmTabStore'
import { useState } from 'react'
import MemberAdd from './MemberAdd'
import Members from './Members'

const CRM = () => {
  const selected = useCrmStore(state => state.selectedTab)
  const setSelected = useCrmStore(state => state.setSelectedTab)
  const selectedCategory = crm_tabs.find(c => c.id === selected)

  const [memberView, setMemberView] = useState('list')

  return (
    <ContentLayout>
      <div className='flex justify-between'>
        <span className='text-lg font-semibold text-textblack'>
          Customer Relationship Management
        </span>

        <Button
          size='addbutton'
          onClick={() => {
            setSelected(1)
            setMemberView('add')
          }}
        >
          + Add Member
        </Button>
      </div>

      <CustomeVerticalSelect
        options={crm_tabs}
        selected={selected}
        onSelect={id => {
          setSelected(id)
          setMemberView('list')
        }}
        heading={
          selected === 1 && memberView === 'add'
            ? 'Add Member'
            : selectedCategory?.heading
        }
      >
        {selected === 1 ? (
          memberView === 'add' ? (
            <MemberAdd goBack={() => setMemberView('list')} />
          ) : (
            <Members />
          )
        ) : (
          selectedCategory?.component_view
        )}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default CRM
