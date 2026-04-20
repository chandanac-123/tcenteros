
const HeaderCard = ({ cardsData }) => {

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
