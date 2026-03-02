import ContentLayout from "@common/masterLayout/ContentLayout"
import { Button } from '@pages/components/ui/button'
import filters from '@assets/form-icons/filter.svg'
import WalletTable from "./WalletTable"
import { useState } from "react"
import AddWallet from "./AddWallet"
import {
  useGetWalletSummaryQuery,
  useGetWalletTransactionsQuery
} from "@api-queries/wallet/Query"
import WalletFilter from "./component/WalletFilter"
import CustomDatePicker from "@common/CustomeDatepicker"
import { format } from "date-fns"
import { useGetWalletAmountQuery } from "@api-queries/wallet/Query"


const Wallet = () => {
  const [open, setOpen] = useState(false)
  const [openFilter, setOpenFilter] = useState(false);
  const [filter, setFilter] = useState({
    type: "",
    transaction_type: "",
    status: ""
  })
  const [tableParams, setTableParams] = useState({
    page: 1,
    page_size: 10,
    type: '',
    transaction_type: '',
    status: '',
    start_date: '',
    end_date: '',
  });
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  })
  const { data, isPending, isError } = useGetWalletSummaryQuery();
  const { data: dataList, isLoading, error } = useGetWalletTransactionsQuery(tableParams);
  const { data: walletAmout, refetch: refetchWalletAmount } = useGetWalletAmountQuery()
  console.log("walletAmout", walletAmout);
  const walletBalance = walletAmout?.available_balance ?? walletAmout?.balance ?? 0
  const buttonLabel = walletBalance === 0 ? "Add Wallet" : "Add Top Up"




  const applyFilters = () => {
    setTableParams(prev => ({
      ...prev,
      page: 1,
      type: filter.type,
      transaction_type: filter.transaction_type,
      status: filter.status,
      start_date: dateRange?.from
        ? format(dateRange.from, "yyyy-MM-dd")
        : "",
      end_date: dateRange?.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : "",
    }))
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
          >  + {buttonLabel}</Button>
        </div>
        <AddWallet open={open} setOpen={setOpen} refetchWalletAmount={refetchWalletAmount} />

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              Available Balance
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ {data?.available_balance || "_ _ "}
            </span>
          </div>

          {/* <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
             Pending Settlement
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              ₹ 24,853.00
            </span>
          </div> */}

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              This month credit
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              {`₹ ${data?.month_credit ?? "_ _"}`}
            </span>
          </div>

          <div className="flex flex-col rounded-xl bg-white shadow-[3px_3px_22px_1px_rgba(126,2,246,0.12)] py-5 px-10">
            <span className="text-[#3A3A3A] font-poppins text-[14px] font-medium leading-[20px] tracking-[-0.28px]">
              This Month Debit
            </span>
            <span className="text-black font-poppins text-[18px] font-semibold leading-[32px] tracking-[-0.36px]">
              {`₹ ${data?.month_debit ?? "_ _"}`}
            </span>
          </div>

        </div>

        {/* Wallet Table Section */}
        <div className="">
          <div className="flex items-center justify-between">
            <h2 className="text-black font-roboto text-[24px] font-medium leading-[140%] tracking-[-0.24px]">Wallet Transaction List</h2>
            <div className=" flex gap-3">

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

              <button onClick={() => setOpenFilter(true)}>
                <img
                  src={filters}
                  alt="filter"
                  className="border-2 h-9 w-12 p-1 border-primary  rounded-[9px]"
                />
              </button>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="">

          <WalletTable
            data={dataList?.transactions || []}
            tableParams={tableParams}
            pagination={dataList?.total}
            loading={isLoading}
            setTableParams={setTableParams}
          />

        </div>
      </div>

      {/* Filter Modal */}



      <WalletFilter
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
        filter={filter}
        setFilter={setFilter}
        onApply={applyFilters}
      />

    </ContentLayout >
  )
}
export default Wallet