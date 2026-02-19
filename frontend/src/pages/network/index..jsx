import ContentLayout from "@common/masterLayout/ContentLayout"
import { Switch } from "@pages/components/ui/switch"
import NetworkTables from "./NetworkTables"
import calender from '@assets/header-icons/calender.svg'
import CustomeTab from '@common/CustomeTab'
import { useState } from "react"
import AmountForm from "./AmountForm"

const Network = () => {
  const [activeTab, setActiveTab] = useState("Network")
  const [open, setOpen] = useState(false)

  const networkTabs = [
    { id: 1, name: 'Network' },
    { id: 2, name: 'Requests' },
    { id: 3, name: 'Completed' }
  ]
  return (
    <ContentLayout>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex flex-col'>
          <span >Network</span>

        </div>
        <div className='flex-1 flex justify-end items-center gap-2'>


        </div>
      </div>
      {/* :::::Enable Button Container::::: */}
      <div className="bg-[#F5EEFC] flex flex-col gap-5 lg:flex-row justify-between items-center p-5 rounded-[12px]">
        <div className="">
          <span className="text-[20px] text-[#8B24E2]">Enable Networks</span>
          <br />
          <span className="text-[16px] text-[#3F3939]">Enable Network Access to allow members from other affiliated centers to check in and work out at your facility. </span>
        </div>

        {/* :::: Amount Button ::::: */}
        <button  onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-[12px] border-2 border-[#1452D4] text-[#1452D4] font-medium hover:bg-[#1452D4] hover:text-white transition"
        >
          Add Network Amount
        </button>

        <AmountForm open={open} setOpen={setOpen} />



        {/* :::::: Switch :::::: */}
        <div className=""><Switch /></div>
      </div>


      {/* :::::: Status And Filter Component :::::: */}

      <div className='flex  flex-col gap-5 sm:gap-0 sm:flex-row justify-between items-center mb-4 p-3'>
        <CustomeTab
          tabList={networkTabs}
          defaultVal="Network"
          tabsListClass="p-[1px]"
          onChange={(value) => setActiveTab(value)}
        />

        <div className='flex gap-2'>
          <button>
            <img
              src={calender}
              alt='calender'
              className='bg-primary p-2 rounded-md'
            />
          </button>
        </div>
      </div>

      {/* <NetworkButtons/> */}
      <div className=" p-5">
        <NetworkTables
          activeTab={activeTab}
        />

      </div>

    </ContentLayout>
  )
}
export default Network