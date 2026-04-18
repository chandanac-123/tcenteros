import { FileBadge, Handshake, Network, Split } from "lucide-react";
import React from "react";

const LineBarChart = ({ data = [] }) => {
    const icons = [FileBadge, Split, Handshake, Network];

    return (
        <div className="w-full p">

            <div className="flex flex-col gap-4">
                {data.map((item, i) => {
                    const Icon = icons[i % icons.length]; // 👈 safe mapping

                    return (
                        <div key={i}>

                            {/* Label + Value with Icon */}
                            <div className="flex w-full items-center justify-evenly border p-3 rounded-lg shadow-lg">
                                <div className="">
                                    <div className="w-14 h-14 flex items-center justify-center rounded-full border border-[#DAD9D9] shadow-md">
                                        <Icon size={20} color="#1452D4"/>
                                    </div>
                                </div>
                                <div className="w-[60%] flex flex-col gap-">
                                    <span className="text-[#323131] font-poppins text-[16px] font-semibold ">
                                        {item.label}
                                    </span>
                                    <div className=" h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
                                        <div
                                            className="h-2 rounded-full"
                                            style={{
                                                width: `${item.value}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>

                                <span className="text-black">
                               <p className="text-black font-semibold text-[20px] font-poppins">₹ {item.amount}</p>
                                </span>
                            </div>

                            {/* Progress Line */}


                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LineBarChart;