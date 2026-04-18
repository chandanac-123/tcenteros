import {
  RefreshCcw,
  HandCoins,
  Lock,
  Book,
  FolderSync,
  FileBadge,
  Split,
  Network
} from "lucide-react";

const RevenueCards = () => {
  return (

    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* MRR */}
      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <HandCoins size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Monthly Recurring Revenue (MRR)
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">1.5 CR</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#D5FFE6] rounded-md">
            <span className="text-[#03881B] text-xs font-medium">+12%</span>
          </div>
        </div>
      </div>

      {/* ARR */}
      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <Lock size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Yearly Locked Revenue (ARR)
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">16.33 CR</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#D5FFE6] rounded-md">
            <span className="text-[#03881B] text-xs font-medium">+15%</span>
          </div>
        </div>
      </div>

      {/* Renewal Forecast */}
      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <RefreshCcw size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            30 Days Renewal Forecast
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">48 L</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>

      {/* Pending Commission */}
      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <Book size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Pending Commission Payout
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">₹56,789</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <FileBadge size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Subscriptions
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">₹55.8 L </p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>


      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <FolderSync size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Subscription Renewals
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000]  text-xl font-semibold">₹16.55 L</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>


      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <Split size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Branch Purchases
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">₹68.54 L</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>


      <div className="bg-[#FFFFFF] border border-[#E0DDD8] rounded-xl shadow-md p-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full border border-[#DAD9D9]">
            <Network size={20} color="#1452D4" />
          </div>
          <p className="text-[#555555] text-sm font-medium">
            Network Commission
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[#000000] text-xl font-semibold">₹56,789</p>

          <div className="flex items-center gap-1 px-2 py-1 bg-[#FFD6D5] rounded-md">
            <span className="text-[#880303] text-xs font-medium">-18%</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RevenueCards;