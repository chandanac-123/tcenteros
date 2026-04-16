import { MapPin } from 'lucide-react'
import React from 'react'

const PartnerDisplay = () => {
    return (
        <div>
            <div className="w-full bg-white rounded-xl shadow-md border border-[#E0DDD8] p-4 flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Avatar */}
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#434242] shrink-0">
                    <div className="w-10 h-10 relative">
                        <div className="absolute w-6 h-4 bg-[#F2B80A] top-0 right-0 rounded-sm" />
                        <div className="absolute w-8 h-8 bg-[#F2B80A] bottom-0 left-0 rounded-sm" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-1">

                    {/* Top Row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-[#313030]">
                            Anil Kumar S
                        </h2>

                        {/* Status */}
                        <span className="flex items-center gap-1 px-2 py-[2px] rounded-full bg-[#D5FFE6] text-[#03881C] text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#03881C]" />
                            Active
                        </span>

                        {/* Region */}
                        <span className="px-2 py-[2px] rounded-md bg-[#E3ECFF] text-[#1452D4] text-xs">
                            West
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-[#666666]">
                        <MapPin size={16} />
                        <span>Worli, Mumbai</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default PartnerDisplay
