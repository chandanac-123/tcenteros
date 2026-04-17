import ContentLayout from '@common/MasterLayout/ContentLayout'
import { Split } from 'lucide-react'
import React from 'react'
import AddBranchPrice from './components/AddBranchPrice'
import BranchingTable from './components/BranchingTable'

const Branching = () => {
  return (
    <ContentLayout>
      <div>
        <div className="flex items-center gap-4 p-4">
          <div className=" p-3 rounded-full shadow-[0px_5px_15px_rgba(0,0,0,0.35)]">
            <Split size={30} className="text-onboard_primary" />
          </div>
          <div className="flex flex-col justify-center gap-3">
            <h1 className="text-[#3A3A3A] font-poppins text-[18px] font-semibold leading-[12px]">
              Branching
            </h1>
            <p className="text-[#393636] font-inter text-[14px] font-medium">
              Manage all center branches across the platform
            </p>
          </div>
        </div>


        <div className="px-4 flex flex-col gap-5 ">
          <AddBranchPrice />
          <BranchingTable />
        </div>
      </div>
    </ContentLayout>

  )
}

export default Branching
