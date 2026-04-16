import { TrendingUp, TrendingDown } from "lucide-react";

const TrendBadge = ({ value }) => {
  const isPositive = value >= 0;

  return (
    <span
      className={`flex items-center gap-2 text-xs rounded-xl px-2 py-1
        ${isPositive ? "bg-green_bg text-green_text" : "bg-red_bg text-red_text"}
      `}
    >
      {isPositive ? `+${value}%` : `${value}%`}
      
      {isPositive ? (
        <TrendingUp className="w-4 h-4 text-green_text" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red_text" />
      )}
    </span>
  );
};

export default TrendBadge;