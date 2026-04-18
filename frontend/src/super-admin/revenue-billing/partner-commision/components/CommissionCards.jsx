import { BadgeIndianRupee, Book, HandCoins } from 'lucide-react'
import React from 'react'

const CommissionCards = () => {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <HandCoins size={20} color="#1452D4" />
                    </div>
                    <p className="text-[#555555] text-sm font-medium">
                        Total Commission
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-[#000000] text-xl font-semibold">₹12,32,4700</p>


                </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <BadgeIndianRupee size={20} color="#1452D4" />
                    </div>
                    <p className="text-[#555555] text-sm font-medium">
                        Total Commission
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-[#268938] text-xl font-semibold">₹2,47,567</p>


                </div>
            </div>

            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <Book size={20} color="#1452D4" />
                    </div>
                    <p className="text-[#555555] text-sm font-medium">
                        Pending Commission
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-[#C42A08] text-xl font-semibold">₹12,32,4700</p>


                </div>
            </div>

        </div>
    )
}

export default CommissionCards
