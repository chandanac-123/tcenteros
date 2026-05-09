import { formatIndianCurrency } from "@utils/helper";

const GrowingCenterCard = ({ data }) => {
  return (
    <div className="w-full h-20 border cursor-pointer flex flex-col justify-center p-3 bg-textwhite rounded-xl shadow-primary-shadow">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.10)]">
            {data?.icon}
          </div>
          <div>
            <span className="text-sm font-medium text-grey">
              {data?.center_name}
            </span>

            <span className="text-sm font-medium text-grey">
              {data?.sublabel}
            </span>
          </div>
        </div>
        <span className="text-lg font-semibold">
          ₹{formatIndianCurrency(data?.monthly_revenue)}
        </span>
      </div>
    </div>
  );
};

export default GrowingCenterCard;
