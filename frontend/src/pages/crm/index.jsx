import CustomeVerticalSelect from '@common/CustomeVerticalSelect'
import ContentLayout from '@common/MasterLayout/ContentLayout'
import { crm_tabs } from '@constants/crmTabs'
import { Button } from '@pages/components/ui/button'
import { useCrmStore } from '@store/crmTabStore'
import { useNavigate } from 'react-router-dom'

const CRM = () => {
  const navigate = useNavigate()
  const selected = useCrmStore(state => state.selectedTab)
  console.log('selected: ', selected)
  const setSelected = useCrmStore(state => state.setSelectedTab)
  console.log('setSelected: ', setSelected)
  const selectedCategory = crm_tabs?.find(c => c?.id === selected)

  return (
    <ContentLayout>
      <div className='flex justify-between'>
        <span className='text-lg font-semibold text-textblack'>
          Customer Relationship Management{' '}
        </span>
        <div className='flex'>
          <Button size='addbutton' onClick={() => navigate('/crm/member-add')}>
            {' '}
            + Add Member
          </Button>
        </div>
      </div>
      <CustomeVerticalSelect
        options={crm_tabs}
        selected={selected}
        onSelect={setSelected}
        heading={selectedCategory?.heading}
      >
        {selectedCategory?.component_view}
      </CustomeVerticalSelect>
    </ContentLayout>
  )
}
export default CRM
