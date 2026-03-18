import React from 'react'
import CustomeModal from '@common/components/CustomeModal'


const ViewWallet = ({ open, setOpen }) => {

    return (
        <CustomeModal open={open} onOpenChange={setOpen}>
            <form className="space-y-4 px-5">
                <h2 className="min-w-[300px] text-[20px] leading-[30px] bg-[#F0DEFF] rounded-lg p-3">
                    Wallet  Details
                </h2>
                <div className="grid grid-cols-1 gap-4 p-2">

                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Txn ID</span>
                            <span className="text-black font-poppins text-[17px] font-normal">TXN102</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Date</span>
                            <span className="text-black font-poppins text-[17px] font-normal">18 Jan 2026</span>
                        </div>
                    </div>


                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Type</span>
                            <span>Debit</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Category</span>
                            <span className="text-black font-poppins text-[17px] font-normal">Network_IN</span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Transaction Center</span>
                            <span className="text-black font-poppins text-[17px] font-normal">2bfit</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Credit</span>
                            <span className="text-black font-poppins text-[17px] font-normal">₹ 16,640.00</span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Debit</span>
                            <span className="text-black font-poppins text-[17px] font-normal">₹ 16,100</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Balance After</span>
                            <span className="text-black font-poppins text-[17px] font-normal">₹ 16,640.00</span>
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <div className="flex flex-col">
                            <span className="text-black font-poppins text-[14px] font-normal">Status</span>
                            <span className="text-black font-poppins text-[17px] font-normal">Pending</span>
                        </div>

                    </div>




                </div>



            </form>
        </CustomeModal>
    )
}

export default ViewWallet
