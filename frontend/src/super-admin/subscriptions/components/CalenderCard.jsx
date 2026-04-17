const CalenderCard = ({ day, renewals, revenue }) => {
  return (
    <div className="flex  flex-col border rounded-xl p-2 w-40  gap-2 shadow-[0px_5px_15px_rgba(0,0,0,0.15)] hover:text-onboard_primary hover:border-onboard_primary cursor-pointer">
      <span className="flex  text-onboard_primary rounded-full w-6 h-6 border shadow-[0px_5px_15px_rgba(0,0,0,0.15)] text-xs justify-center items-center">
        {day}
      </span>
      <div className="flex flex-col justify-center items-center gap-2">
        <span className="flex text-xs text-gray">{renewals} Renewals</span>
        <span>₹{revenue.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default CalenderCard;
