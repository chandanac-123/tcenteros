import TrendBadge from "@common/components/TrendBadge";

const BaseCard = ({ data, growingCenter = false }) => {
  console.log("data: ", data);
  return (
    <div className="w-full h-20 border cursor-pointer flex flex-col justify-center p-3 bg-textwhite rounded-xl shadow-primary-shadow">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <img src={data?.icon} alt={data?.label} className="w-12 h-12" />
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
            {data?.value}
          </span>
        )}
      </div>
    </div>
  );
};

export default BaseCard;
