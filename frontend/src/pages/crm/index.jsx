import CustomeVerticalSelect from '@common/CustomeVerticalSelect'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { crm_tabs } from '@constants/crmTabs'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/crmTabStore'
import { useState } from 'react'
import Members from './member'
import MemberView from './member/MemberView'
import MemberAdd from './member/MemberAdd'
import { SquarePen } from 'lucide-react'

const CRM = () => {
  const selected = useCrmStore(state => state.selectedTab)
  const setSelected = useCrmStore(state => state.setSelectedTab)
  const selectedCategory = crm_tabs.find(c => c.id === selected)
  const [memberView, setMemberView] = useState('list')
  const [selectedMemberId, setSelectedMemberId] = useState(null)

  return (
    <ContentLayout>
      <div className='flex justify-between'>
        <span className='text-xl font-semibold text-textblack'>
          Customer Relationship Management
        </span>
        <div>
          {selected === 1 && memberView === 'list' && (
            <Button size='addbutton' onClick={() => setMemberView('add')}>
              + Add Member
            </Button>
          )}

          {selected === 1 && memberView === 'view' && (
            <Button size='addbutton' onClick={() => setMemberView('edit')}>
              <SquarePen />
              Edit
            </Button>
          )}
        </div>
      </div>

      <CustomeVerticalSelect
        options={crm_tabs}
        selected={selected}
        onSelect={id => {
          setSelected(id)
          setMemberView('list')
        }}
        heading={
          selected === 1
            ? memberView === 'add'
              ? 'Add Member'
              : memberView === 'view'
              ? 'Member Details'
              : memberView === 'edit'
              ? 'Edit Member'
              : 'Members'
            : selectedCategory?.heading
        }
      >
        {selected === 1 ? (
          memberView === 'add' ? (
            <MemberAdd goBack={() => setMemberView('list')} />
          ) : memberView === 'view' ? (
            <MemberView
              memberId={selectedMemberId}
              goBack={() => setMemberView('list')}
            />
          ) : memberView === 'edit' ? (
            <MemberAdd
              memberId={selectedMemberId}
              isEdit
              goBack={() => setMemberView('list')}
            />
          ) : (
            <Members
              onView={id => {
                setSelectedMemberId(id)
                setMemberView('view')
              }}
              onEdit={id => {
                setSelectedMemberId(id)
                setMemberView('edit')
              }}
            />
          )
        ) : (
          selectedCategory?.component_view
        )}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default CRM
