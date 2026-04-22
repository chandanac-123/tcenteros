import React from 'react'
import {
    Users,
    UserPlus,
    PhoneCall,
    Presentation,
} from "lucide-react";

const LeadCards = () => {
    return (
        <div className="">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total Leads */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Users size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Total Leads
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        23
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#25AF00]" />
                </div>

                {/* New Leads */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <UserPlus size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Today Leads
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        8
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#1452D4]" />
                </div>



            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

                {/* New */}

                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <PhoneCall size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            New
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        11
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#D4AA08]" />
                </div>

                {/* Contacted */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Presentation size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Contacted
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        4
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#8B24E2]" />
                </div>

                {/* Demo Done */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <PhoneCall size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Demo Done
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        11
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#D4AA08]" />
                </div>

                {/* Interested */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Presentation size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Interested
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        4
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#8B24E2]" />
                </div>

                {/* Converted */}
                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Presentation size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Converted
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        4
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#8B24E2]" />
                </div>


                {/* Closed */}

                <div className="p-4 rounded-2xl flex flex-col gap-4 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Presentation size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Closed
                        </p>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                        4
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#8B24E2]" />
                </div>

            </div>
        </div>

    )
}

export default LeadCards
