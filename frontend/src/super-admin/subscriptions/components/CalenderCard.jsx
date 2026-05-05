import { Spinner } from "@pages/components/ui/spinner";

const CalenderCard = ({
  day,
  renewals,
  revenue,
  onClick,
  isToday,
  loading,
}) => {
  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <div
          onClick={onClick}
          className={`flex  w-full flex-col border rounded-xl p-2 gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.15)] cursor-pointer
        ${isToday ? "border-onboard_primary bg-blue-50" : "hover:text-onboard_primary hover:border-onboard_primary"}
      `}
        >
          <span
            className={`flex rounded-full w-6 h-6 border text-xs justify-center items-center shadow-[0px_5px_15px_rgba(0,0,0,0.15)]
          ${isToday ? "bg-onboard_primary text-white" : "text-onboard_primary"}
        `}
          >
            {day}
          </span>

          <div className="flex flex-col justify-center items-center gap-2">
            <span className="flex text-xs text-gray">{renewals} Renewals</span>
            <span className={`${revenue?"text-red":"text-gray-300"}`}>₹{revenue?.toLocaleString()}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default CalenderCard;
