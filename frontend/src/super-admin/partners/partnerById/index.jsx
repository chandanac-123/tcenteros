import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Handshake } from 'lucide-react'
import React, { useState } from 'react'
import PartnerDisplay from './components/PartnerDisplay'
import PartnerCards from './components/PartnerCards'
import CustomeTab from '@common/components/CustomeTab'
import AssiginedCenters from './components/AssiginedCenters'
import CommissionLedger from './components/CommissionLedger'

const PartnerById = () => {
    const partnerTabs = [
        { id: 'center_assigined', name: 'Center Assigned', component: <AssiginedCenters /> },
        { id: 'commission_ledger', name: 'Commission Ledger', component: <CommissionLedger /> }
    ]

      const [activeTab, setActiveTab] = useState('center_assigined')
    
    return (
        <ContentLayout>
            <div>
                <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-4 p-4">
                        <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
                            <Handshake size={30} className="text-onboard_primary" />
                        </div>
                        <div className="flex flex-col justify-center gap-3">
                            <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                                Partners Management
                            </p>
                            <p className="text-[#393636] font-inter text-[14px] font-medium">
                                Manage reseller partners and commissions
                            </p>
                        </div>
                    </div>

                    {/* <div className="pe-5">
                    <Button size="addbutton" onClick={() => setOpen(true)}>
                        <CircleArrowDown />
                        Export Report
                    </Button>
                </div> */}
                </div>

                <div className="px-5 flex flex-col gap-5">
                    <PartnerDisplay />
                    <PartnerCards />
                </div>

                <div className="">
                    <CustomeTab
                        tabList={partnerTabs}
                        value={activeTab}
                        defaultVal='center_assigined'
                        onChange={setActiveTab}
                    />
                </div>
            </div>
        </ContentLayout>

    )
}

export default PartnerById
