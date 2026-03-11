import ContentLayout from '@common/MasterLayout/ContentLayout'
import CustomeTab from '@common/components/CustomeTab'
import { useState } from 'react'
import IncomeTable from './IncomeTable'
import ExpenseTable from './ExpenseTable'
import SettlementTable from './SettlementTable'

const Reports = () => {
  const [activeTab, setActiveTab] = useState('Income')
  const employeeOrMember = [
    { id: 1, name: 'Income', component: <IncomeTable /> },
    { id: 2, name: 'Expenses ', component: <ExpenseTable /> },
    { id: 3, name: 'Settlement', component: <SettlementTable /> }
  ]
  return (
    <ContentLayout>
      <h1 className='text-xl font-semibold text-textblack mb-4'>
        Reports - {activeTab}
      </h1>
      <div className='flex justify-between items-center mb-4'>
        <CustomeTab
          tabList={employeeOrMember}
          defaultVal='Income'
          tabsListClass='p-[1px]'
          onChange={value => setActiveTab(value)}
        />
      </div>
      {/* Render table based on activeTab */}
      {activeTab === 'Income' && <IncomeTable />}
      {activeTab === 'Expenses ' && <ExpenseTable />}
      {activeTab === 'Settlement' && <SettlementTable />}
    </ContentLayout>
  )
}

export default Reports
