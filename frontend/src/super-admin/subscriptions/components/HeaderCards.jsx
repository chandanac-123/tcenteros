import { Briefcase, Calendar, Clock, Network, Receipt, Split } from "lucide-react";

const HeaderCard = ({ data }) => {
  const cardsData = [
    {
      label: "Total Revenue",
      value: 0,
      icon: <Briefcase size={16} strokeWidth={2.75} />,
    },
    {
      label: "Monthly Revenue",
      value: 0,
      icon: <Receipt size={16} strokeWidth={2.75} />,
    },
    {
      label: "Renewal Date",
      value: 0,
      icon: <Calendar size={16} strokeWidth={2.75} />,
    },
    {
      label: "Days Remaining",
      value: 0,
      icon: <Clock size={16} strokeWidth={2.75} />,
    },
    {
      label: "Network commission",
      value: 0,
      icon: <Network size={16} strokeWidth={2.75} />,
    },
    {
      label: "Branch Count",
      value: 0,
      icon: <Split size={16} strokeWidth={2.75} />,
    },
  ];
  return (
    <>
      {cardsData?.map((item, index) => (
        <div
          key={index}
          className="w-full h-24 cursor-pointer flex flex-col justify-between p-4 bg-textwhite rounded-xl shadow-primary-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className=" p-2 text-onboard_primary rounded-full border shadow-[0px_5px_15px_rgba(0,0,0,0.15)]">
              {item?.icon}
            </div>
            <span className="text-xs font-medium text-grey">{item?.label}</span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-xl font-bold text-textblack">1,247</span>
          </div>
        </div>
      ))}
    </>
  );
};

export default HeaderCard;
