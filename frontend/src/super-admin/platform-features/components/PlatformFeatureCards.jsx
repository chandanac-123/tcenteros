import {
    ChartBarStacked,
    CircleCheckBig,
    CircleDollarSign,
    Crown,
    Edit,
    Trash,
    Waypoints,
} from "lucide-react";
import React, { useState } from "react";
import UpdateplatformFeature from "./modals/UpdateplatformFeature";
import DeleteplatformFeature from "./modals/DeleteplatformFeature";

const PlatformFeatureCards = () => {
    const [activeIndex, setActiveIndex] = useState(null);
    const [openUpdateModal, setOpenUpdateModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);

    const features = [
        {
            title: "Analytics Dashboard",
            description:
                "Track member check-ins and attendance across all centers",
            icon: CircleCheckBig,
        },
        {
            title: "Analytics Dashboard",
            description: "Real-time insights and usage metrics",
            icon: ChartBarStacked,
        },
        {
            title: "Custom Branding",
            description: "White-label interface customization",
            icon: Crown,
        },
        {
            title: "Network Access",
            description: "Cross-center member access and roaming",
            icon: Waypoints,
        },
        {
            title: "Payment Processing",
            description: "Integrated billing and payment collection",
            icon: CircleDollarSign,
        },
    ];

    return (
        <>
            <div className="flex flex-col gap-3 px-5 py-3">
                {features.map((item, index) => {
                    const Icon = item.icon;

                    return (
                        <div key={index} className="flex flex-col gap-2">
                            {/* CARD */}
                            <div
                                onClick={() =>
                                    setActiveIndex(activeIndex === index ? null : index)
                                }
                                className="w-full bg-white border border-stone-200 rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.09)] p-4 sm:p-5 cursor-pointer transform transition-all duration-300 ease-in-out hover:scale-[1.02]"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                                    {/* Icon */}
                                    <div className="md:col-span-1 flex justify-center md:justify-start">
                                        <div className="w-20 h-20 p-3 bg-white rounded-full shadow-[0px_2px_8px_rgba(0,0,0,0.13)] flex items-center justify-center">
                                            <Icon size={40} className="text-onboard_primary" />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <div className="md:col-span-5 text-center md:text-left">
                                        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
                                            <h2 className="text-zinc-800 text-base sm:text-lg font-semibold font-inter">
                                                {item.title}
                                            </h2>

                                            <div className="inline-flex items-center gap-1 bg-emerald-100 px-3 py-0.5 rounded-full">
                                                <span className="w-1.5 h-1.5 bg-green-700 rounded-full" />
                                                <span className="text-green-700 text-[12px] font-medium">
                                                    Active
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-stone-500 text-xs sm:text-sm mt-1">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Centers */}
                                    <div className="md:col-span-3 text-center">
                                        <p className="text-stone-500 text-xs">
                                            Number of Centers Using
                                        </p>
                                        <p className="text-blue-700 text-base sm:text-lg font-semibold mt-1">
                                            124
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="md:col-span-3 text-center">
                                        <p className="text-stone-500 text-xs">
                                            Price For The Feature
                                        </p>
                                        <p className="text-black text-base sm:text-lg font-semibold mt-1">
                                            ₹2800
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ACTION DROPDOWN */}
                            {activeIndex === index && (
                                <div className="flex justify-end">
                                    <div className="w-full max-w-[150px] bg-white rounded-xl shadow-[0px_2px_7.5px_rgba(0,0,0,0.26)] p-2 flex flex-col gap-2">

                                        {/* UPDATE */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent card click
                                                setSelectedFeature(item);
                                                setOpenUpdateModal(true);
                                                setActiveIndex(null); // close dropdown
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-onboard_primary text-sm font-medium hover:bg-blue-700/20 transition"
                                        >
                                            <Edit size={18} className="text-onboard_primary"/>
                                            Update
                                        </button>

                                        {/* DELETE */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenDeleteModal(true)
                                                setSelectedFeature(item);
                                                setActiveIndex(null);
                                            }}
                                            className="w-full flex items-center justify-center text-red_text gap-2 py-2 rounded-lg text-red-700 text-sm font-medium hover:bg-red-100 transition"
                                        >
                                            <Trash size={18} className="text-red_text"/>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ✅ SINGLE MODAL OUTSIDE MAP */}
            <UpdateplatformFeature
                open={openUpdateModal}
                setOpen={setOpenUpdateModal}
                data={selectedFeature}
            />

            <DeleteplatformFeature
                open={openDeleteModal}
                setOpen={setOpenDeleteModal}
                data={selectedFeature}
            />
        </>
    );
};

export default PlatformFeatureCards;