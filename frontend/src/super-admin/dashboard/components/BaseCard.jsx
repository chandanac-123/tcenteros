import TrendBadge from "@common/components/TrendBadge";

const formatCardValue = (value, type) => {
  if (value === null || value === undefined) return "-";

  if (type === "amount") {
    return `₹${value}`;
  }

  if (type === "percent") {
    return `${value}%`;
  }

  return value;
};
const BaseCard = ({ data, growingCenter = false }) => {
  const currentType = data?.type;
  return (
    <div className="w-full h-20 border cursor-pointer flex flex-col justify-center p-3 bg-textwhite rounded-xl shadow-primary-shadow">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.10)]">
            {data?.icon}
          </div>
          <div>
            <span className="text-sm font-medium text-grey">{data?.label}</span>
            {growingCenter && (
              <span className="text-sm font-medium text-grey">
                {data?.sublabel}
              </span>
            )}
          </div>
        </div>

        {growingCenter ? (
          <TrendBadge value={data?.value} />
        ) : (
          <span className="text-xl font-bold text-textblack">
            {formatCardValue(data?.value, currentType)}
          </span>
        )}
      </div>
    </div>
  );
};

export default BaseCard;
