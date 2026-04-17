import { ChartNoAxesCombined, ChartSpline, TrendingDown, TrendingUp, UserRoundPlus, Users } from 'lucide-react'
import React from 'react'

const AnalyticsCards = () => {
    return (
        <div className="flex flex-col gap-4  p-5 rounded-lg">
            <h2 className="text-[#3A3A3A] font-poppins text-[20px] font-semibold ">Membership Analytics</h2>
            <div className=" grid grid-cols-1 lg:grid-cols-4 gap-4">

                <div className="w-full max-w-sm p-4 bg-[#FFFFFF] rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] flex flex-col gap-4">

                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9] shadow-md">
                            <Users size={20} color="#1452D4" />
                        </div>

                        <p className="text-[#555555] text-sm font-medium">
                            Total Active Members
                        </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">

                        <h2 className="text-[#000000] text-2xl font-semibold">
                            48,392
                        </h2>

                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#ffa099bb]">
                            <span className="text-[#900707] text-xs font-medium">
                                -8%
                            </span>
                            <TrendingDown size={14} color="#900707" />
                        </div>

                    </div>
                </div>

                <div className="w-full max-w-sm p-4 bg-[#FFFFFF] rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] flex flex-col gap-4">

                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9] shadow-md">
                            <UserRoundPlus size={20} color="#1452D4" />
                        </div>

                        <p className="text-[#555555] text-sm font-medium">
                            New Members This Month
                        </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">

                        <h2 className="text-[#000000] text-2xl font-semibold">
                            +734
                        </h2>

                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#D5FFE6]">
                            <span className="text-[#03881B] text-xs font-medium">
                                +8%
                            </span>
                            <TrendingUp size={14} color="#03881B" />
                        </div>

                    </div>
                </div>

                <div className="w-full max-w-sm p-4 bg-[#FFFFFF] rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] flex flex-col gap-4">

                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]  shadow-md">
                            <ChartSpline size={20} color="#1452D4" />
                        </div>

                        <p className="text-[#555555] text-sm font-medium">
                            Average Per Center
                        </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">

                        <h2 className="text-[#000000] text-2xl font-semibold">
                            38.4%
                        </h2>

                        {/* <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#ffa099bb]">
                        <span className="text-[#900707] text-xs font-medium">
                            -8%
                        </span>
                        <TrendingDown size={14} color="#900707" />
                    </div> */}

                    </div>
                </div>

                <div className="w-full max-w-sm p-4 bg-[#FFFFFF] rounded-xl shadow-[0px_4px_12.8px_rgba(0,0,0,0.09)] border border-[#E0DDD8] flex flex-col gap-4">

                    {/* Top Section */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]  shadow-md">
                            <ChartNoAxesCombined size={20} color="#1452D4" />
                        </div>

                        <p className="text-[#555555] text-sm font-medium">
                            New Members This Month
                        </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex items-center justify-between">

                        <h2 className="text-[#000000] text-2xl font-semibold">
                            + 8.3 %
                        </h2>

                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#D5FFE6]">
                            <span className="text-[#03881B] text-xs font-medium">
                                +4.8 %
                            </span>
                            <TrendingUp size={14} color="#03881B" />
                        </div>

                    </div>
                </div>

            </div>

        
        </div>


    )
}

export default AnalyticsCards
