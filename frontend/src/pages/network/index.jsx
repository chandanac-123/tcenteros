import ContentLayout from "@common/masterLayout/ContentLayout"
import { Switch } from "@pages/components/ui/switch"
import NetworkTables from "./NetworkTables"
import CustomeTab from '@common/components/CustomeTab'
import { useState } from "react"
import AmountForm from "./AmountForm"
import {
  useNetworkToggleButtonMutation,
  useGetNetworkToggleButtonQuery,
  useGetUserNetworkListQuery
} from "@api-queries/network/Query"
import { useNetworkTabStore } from "@store/networkTabstore"
import { format } from "date-fns"
import CustomDatePicker from "@common/components/CustomeDatepicker"


const Network = () => {

  const { activeTab, setActiveTab } = useNetworkTabStore();
  const [open, setOpen] = useState(false)
  const { mutateAsync: enabled, isPending } = useNetworkToggleButtonMutation();
  const { data: networkToggle, isFetching: isNetworkToggleFetching } = useGetNetworkToggleButtonQuery()
  const [tableParams, setTableParams] = useState({
    page: 1,
  })
  const { data, isFetching } = useGetUserNetworkListQuery(tableParams)
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  })
  const networkActive = networkToggle?.network_enabled ?? false

  const networkTabs = [
    { id: 'requests', name: 'Requests' },
    { id: 'network', name: 'Network' },
    { id: 'completed', name: 'Completed' }
  ]

  // ::: Filter the List data with status and Date ::: //

  const list = data?.bookings || [];

  const filteredData = list.filter(item => {
    const status = item.network_status?.toLowerCase();
    const now = new Date().setHours(0, 0, 0, 0);
    const endDateTime = item.end_date
      ? new Date(item.end_date).setHours(0, 0, 0, 0)
      : null;

      
    // Network Tab → ONLY approved
    if (activeTab === "network") {
      return status === "approved";
    }

    // Requests Tab
    if (activeTab === "requests") {
      return (
        ["pending", "approved", "paid"].includes(status) &&
        endDateTime !== null &&
        endDateTime >= now
      );
    }

    // Completed Tab
    if (activeTab === "completed") {
      return endDateTime !== null && endDateTime < now;
    }

    return true;
  });


  // ::::: Functions ::::: //

  const handleToggle = async (checked) => {
    try {
      await enabled(checked)
    } catch (error) {
      console.error(error)
    }
  }

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
          <span className="text-[20px] text-plan_purple">Enable Networks</span>
          <br />
          <span className="text-[16px] text-[#3F3939]">Enable Network Access to allow members from other affiliated centers to check in and work out at your facility. </span>
        </div>


        {/* :::: Amount Button ::::: */}

        <button onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-[12px] border-2 border-overview_bg text-overview_bg font-medium hover:bg-overview_bg hover:text-white transition"
        >
          Add Network Amount
        </button>
        <AmountForm open={open} setOpen={setOpen} />


        {/* :::::: Switch :::::: */}

        <div className="">
          <Switch
            checked={networkActive}
            onCheckedChange={handleToggle}
            disabled={isPending || isNetworkToggleFetching}
          />
        </div>

      </div>


      {/* :::::: Status And Filter Component :::::: */}

      <div className='flex  flex-col gap-5 sm:gap-0 sm:flex-row justify-between items-center mb-4 p-3'>
        <CustomeTab
          tabList={networkTabs}
          tabsListClass="p-[1px]"
          defaultVal={activeTab}
          onChange={setActiveTab}
        />

        <div className='flex gap-2'>
          <CustomDatePicker
            pickerType="range"
            value={dateRange}
            onChange={(range) => {
              setDateRange(range)

              // When both dates selected → apply
              if (range?.from && range?.to) {
                setTableParams(prev => ({
                  ...prev,
                  page: 1,
                  start_date: format(range.from, "yyyy-MM-dd"),
                  end_date: format(range.to, "yyyy-MM-dd"),
                }))
              }

              // When cleared → reset date filter
              if (!range?.from && !range?.to) {
                setTableParams(prev => ({
                  ...prev,
                  page: 1,
                  start_date: "",
                  end_date: "",
                }))
              }
            }}
          />
        </div>
      </div>

      {/* <NetworkButtons/> */}

      <div className="p-5">
        {!data && isFetching ? (
          <div className="flex justify-center py-10">
            <span className="loader">Loading....</span>
          </div>
        ) : (
          <NetworkTables
            activeTab={activeTab}
            data={filteredData}
            tableParams={tableParams}
            pagination={filteredData?.total}
            loading={isFetching}
            setTableParams={setTableParams}
          />
        )}
      </div>
    </ContentLayout>
  )
}
export default Network