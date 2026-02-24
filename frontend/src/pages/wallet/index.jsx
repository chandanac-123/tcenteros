import ContentLayout from "@common/masterLayout/ContentLayout"
import { Button } from '@pages/components/ui/button'
import calender from '@assets/header-icons/calender.svg'
import filters from '@assets/form-icons/filter.svg'
import WalletTable from "./WalletTable"
import { useState } from "react"
import AddWallet from "./AddWallet"
import CustomeModal from '@common/CustomeModal'

const Wallet = () => {
  const [open, setOpen] = useState(false)
  const [openFilter, setOpenFilter] = useState(false);
  const [filter, setFilter] = useState({
    type: "",
    category: "",
    status: ""
  })

  
  const applyFilters = () => {
    console.log("Applied Filters:", filter)

    // later you can filter table data here
  }

  return (
    <ContentLayout>
      <div className="flex flex-col space-y-6 p-2">
        {/* Wallet content goes here */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold ">Wallet</h1>
          <Button
            onClick={() => setOpen(true)}
            size='addbutton'
            type='submit'
          >+ Add Wallet</Button>
        </div>
        <AddWallet open={open} setOpen={setOpen} />

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              Available Balance
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ 24,853.00
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
             Pending Settlement
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ 24,853.00
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              This month credit
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ 24,853.00
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              This Month Debit
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ 24,853.00
            </span>
          </div>

        </div>

        {/* Wallet Table Section */}
        <div className="">
          <div className="flex items-center justify-between">
            <h2 className="text-black font-roboto text-[24px] font-medium leading-[140%] tracking-[-0.24px]">Wallet Transaction List</h2>
            <div className=" flex gap-3">
              <button>
                <img
                  src={calender}
                  alt='calender'
                  className='bg-primary p-3 rounded-md'
                />
              </button>

              <button onClick={() => setOpenFilter(true)}>
                <img
                  src={filters}
                  alt="filter"
                  className="border-2 border-primary p-2 rounded-[9px]"
                />
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="">

          <WalletTable />

        </div>
      </div>

      {/* Filter Modal */}
      <CustomeModal open={openFilter} onOpenChange={setOpenFilter}>
        <div className="p-6  rounded-2xl">

          {/* TYPE */}
          <h3 className="text-md font-medium mb-3">Type</h3>
          <div className="flex gap-3 mb-6">
            {["Credit", "Debit"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter({ ...filter, type })}
                className={`px-5 py-2 rounded-xl font-medium transition
            ${filter.type === type
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-800"}
          `}
              >
                {type}
              </button>
            ))}
          </div>

          {/* CATEGORY */}
          <h3 className="text-md font-medium mb-3">Category</h3>
          <div className="flex gap-3 flex-wrap mb-6">
            {["Network In", "Network Out", "Top-Up"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter({ ...filter, category: cat })}
                className={`px-5 py-2  rounded-xl font-medium transition
            ${filter.category === cat
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-800"}
          `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* STATUS */}
          <h3 className="text-md font-medium mb-3">Status</h3>
          <div className="flex gap-3 flex-wrap mb-8">
            {["Pending", "Completed", "Reserved"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter({ ...filter, status })}
                className={`px-5 py-2 rounded-xl font-medium transition
            ${filter.status === status
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-800"}
          `}
              >
                {status}
              </button>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 ">

            <Button
              onClick={() => setFilter({ type: "", category: "", status: "" })}
              size='addbutton'
              type='submit'
              variant="outline_secondary"
            >Clear</Button>

            <Button
              onClick={() => {
                applyFilters()
                setOpenFilter(false)
              }}
              size='addbutton'
              type='submit'
              variant="outline_primary"
            >Apply</Button>

          </div>

        </div>
      </CustomeModal>

    </ContentLayout >
  )
}
export default Wallet