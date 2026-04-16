import {
    Users,
    Building2,
    IndianRupee,
    Wallet,
} from "lucide-react";

const PartnerCards = () => {
    const stats = [
        {
            title: "Total Number Of Partner",
            value: "247",
            icon: Users,
        },
        {
            title: "Total Number Of Centers",
            value: "48,392",
            icon: Building2,
        },
        {
            title: "Total Revenue",
            value: "₹12,32,4700",
            icon: IndianRupee,
        },
        {
            title: "Pending Payout",
            value: "₹56,789",
            icon: Wallet,
        },
    ];
    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((item, index) => {
                const Icon = item.icon;

                return (
                    <div
                        key={index}
                        className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.09)] p-4 flex flex-col gap-3"
                    >
                        {/* Top */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9] bg-white">
                                <Icon size={20} className="text-[#1452D4]" />
                            </div>

                            <p className="text-[#555555] text-sm font-medium font-inter">
                                {item.title}
                            </p>
                        </div>

                        {/* Value */}
                        <div>
                            <p className="text-[#000000] text-xl sm:text-2xl font-semibold">
                                {item.value}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default PartnerCards
