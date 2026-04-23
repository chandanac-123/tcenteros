import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Button } from '@pages/components/ui/button'
import { Plus, UserRoundCog } from 'lucide-react'
import React from 'react'
import LeadsTableList from './components/LeadsTableList'
import { useNavigate } from 'react-router-dom'

const LeadsManagement = () => {
  const navigate = useNavigate()

  return (
    <ContentLayout>
      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col lg:flex-row items-center lg:justify-between">
          <div className="flex items-center gap-4 p-4">
            <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
              <UserRoundCog size={30} className="text-onboard_primary" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
                Leads Management
              </p>
              <p className="text-[#393636] font-inter text-[14px] font-medium">
                Manage and track all your assigned leads
              </p>
            </div>
          </div>

          <div className="pe-5">
            <Button size="addbutton"
              onClick={() => navigate("/lead-management/add-newLeads")}
            >
              <Plus />
              Add Manual Lead
            </Button>
          </div>
        </div>
      
        <div className="">
          <LeadsTableList />
        </div>
      </div>

    </ContentLayout>

  )
}

export default LeadsManagement
