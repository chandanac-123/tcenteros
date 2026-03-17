import CustomeVerticalSelect from '@common/components/CustomeVerticalSelect'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { crm_tabs } from '@constants/crmTabs'
import { Button } from '@pages/components/ui/button'
import Members from './member'
import MemberView from './member/MemberView'
import MemberAdd from './member/MemberAdd'
import { SquarePen } from 'lucide-react'
import { useCrmStore } from '@store/tabStore'
import VisitorAdd from './visitor/VisitorAdd'
import Visitors from './visitor'
import Guest from './guest'
import { useEffect } from 'react'

const CRM = () => {
  const {
    selectedTab: crmSelectedTab,
    setSelectedTab: setCrmSelectedTab,
    memberView,
    setMemberView,
    visitorView,
    setVisitorView,
    setGuestView,
    selectedMemberId,
    setSelectedMemberId,
    setSelectedTab,
    clearSelectedIds,
    resetCrmState
  } = useCrmStore()

  // Removed resetCrmState to preserve memberView when navigating from header

  const selectedCrmCategory = crm_tabs.find(c => c.id === crmSelectedTab)

  return (
    <ContentLayout>
      <div className='flex justify-between'>
        <span className='text-xl font-semibold text-textblack'>
          Customer Relationship Management
        </span>
        <div>
          {crmSelectedTab === 4 && visitorView === 'list' && (
            <Button
              size='addbutton'
              onClick={() => {
                setVisitorView('add')
                setSelectedTab(4)
              }}
            >
              + Add Visitor
            </Button>
          )}

          {crmSelectedTab === 1 && memberView === 'view' && (
            <Button size='addbutton' onClick={() => setMemberView('edit')}>
              <SquarePen />
              Edit
            </Button>
          )}
        </div>
      </div>

      <CustomeVerticalSelect
        options={crm_tabs}
        selected={crmSelectedTab}
        onSelect={id => {
          setCrmSelectedTab(id)
          setMemberView('list')
          setVisitorView('list')
          setGuestView('list')
          clearSelectedIds()
        }}
        heading={
          crmSelectedTab === 1
            ? memberView === 'add'
              ? 'Add Member'
              : memberView === 'view'
              ? 'Member Details'
              : memberView === 'edit'
              ? 'Edit Member'
              : 'Members'
            : crmSelectedTab === 4
            ? visitorView === 'add'
              ? 'Add Visitor'
              : 'Visitors'
            : crmSelectedTab === 3
            ? 'Guests'
            : selectedCrmCategory?.heading
        }
      >
        {crmSelectedTab === 1 ? (
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
        ) : crmSelectedTab === 4 ? (
          visitorView === 'add' ? (
            <VisitorAdd goBack={() => setVisitorView('list')} />
          ) : (
            <Visitors />
          )
        ) : crmSelectedTab === 3 ? (
          <Guest />
        ) : (
          selectedCrmCategory?.component_view
        )}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}

export default CRM
