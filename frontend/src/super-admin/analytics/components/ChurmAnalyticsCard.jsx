import {
    XCircle,
    Calendar,
    CircleAlert,
    CalendarDays
} from "lucide-react";

const ChurmAnalyticsCard = () => {
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1 */}
            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        < CircleAlert size={20} color="#8F0A0A" />
                    </div>
                    <p className="text-[#8F0A0A] text-sm font-medium">
                        Cancelled Centers
                    </p>
                </div>

                <p className="text-[#8F0A0A] text-2xl font-semibold">47</p>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <CalendarDays size={20} color="#D28303" />
                    </div>
                    <p className="text-[#D28303] text-sm font-medium">
                        Monthly Average Churn Rate
                    </p>
                </div>

                <p className="text-[#D28303] text-2xl font-semibold">3.4%</p>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <Calendar size={20} color="#D28303" />
                    </div>
                    <p className="text-[#D28303] text-sm font-medium">
                        Yearly Average Churn Rate
                    </p>
                </div>

                <p className="text-[#D28303] text-2xl font-semibold">38.4%</p>
            </div>

            {/* Card 4 */}
            <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
                        <XCircle size={20} color="#AC0A0A" />
                    </div>
                    <p className="text-[#AC0A0A] text-sm font-medium">
                        Revenue Loss
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-[#AC0A0A] text-2xl font-semibold">18.7L</p>

                    <div className="flex items-center gap-1 px-2 py-1 bg-[#D5FFE6] rounded-md">
                        <span className="text-[#03881B] text-xs font-medium">+4.8%</span>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ChurmAnalyticsCard
