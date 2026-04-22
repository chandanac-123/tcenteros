import React from 'react'
import {
    Presentation,
    PackageOpen,
    Stone,
    Gift,
    Contact,
    MessageCircleHeart,
    SmilePlus,
    RefreshCcwDot,
    CircleX,
} from "lucide-react";

const LeadCards = () => {
    return (
        <div className="flex items-stretch gap-3">

            <div className="w-[40%] grid grid-cols-2 gap-3">

                <div className="p-4 rounded-2xl flex flex-col justify-evenly bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <PackageOpen size={22} className="text-[#bc4cdf]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Total Leads
                        </p>
                    </div>



                    <h2 className="text-4xl sm:text-5xl font-semibold text-[#000000]">
                        19
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#bc4cdf]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col justify-evenly bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                            <Stone size={22} className="text-[#1452D4]" />
                        </div>
                        <p className="text-base font-medium text-[#555555]">
                            Today's Leads
                        </p>
                    </div>



                    <h2 className="text-4xl sm:text-5xl font-semibold text-[#000000]">
                        4
                    </h2>

                    <div className="h-1.5 rounded-full w-full bg-[#1452D4]" />
                </div>
            </div>

            <div className="w-[60%] grid grid-cols-3 gap-3">

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <Gift size={22} className="text-[#03881C]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                New Leads
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            27
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#62c262]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <Contact size={22} className="text-[#ddda29]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                Contacted Leads
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            4
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#e6e478]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <MessageCircleHeart size={22} className="text-[#1581ce]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                Interested Leads
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            13
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#60aadf]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <SmilePlus size={22} className="text-[#8B24E2]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                Demo Done
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            33
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#8B24E2]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <RefreshCcwDot size={22} className="text-[#6b4807]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                Converted Leads
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            8
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#8b5e0a]" />
                </div>

                <div className="p-4 rounded-2xl flex flex-col gap-2 bg-[#FFFFFF] border border-[#E0DDD8] shadow-[0px_4px_15px_rgba(0,0,0,0.09)]">
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                                <CircleX size={22} className="text-[#da4444]" />
                            </div>
                            <p className="text-base font-medium text-[#555555]">
                                Closed
                            </p>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000]">
                            4
                        </h2>

                    </div>


                    <div className="h-1.5 rounded-full w-full bg-[#da4444]" />
                </div>

            </div>

        </div>
    )
}

export default LeadCards
