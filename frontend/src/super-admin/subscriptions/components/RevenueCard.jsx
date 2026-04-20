const RevenueCard = ({ revenue, avgYear, avgMonth }) => {
  const data = [
    {
      label: "Lifetime Revenue",
      value: revenue ? `₹${revenue.toLocaleString()}` : "₹0",
      color: "text-blue",
    },
    {
      label: "Avg Yearly Revenue",
      value: avgYear ? `₹${avgYear.toLocaleString()}` : "₹0",
      color: "text-green",
    },
    {
      label: "Avg Monthly Revenue",
      value: avgMonth ? `₹${avgMonth.toLocaleString()}` : "₹0",
      color: "text-badge_yellow",
    },
  ];

  return (
    <div className="w-full">
      <h2 className="font-semibold text-base mb-4">Revenue Year Chart</h2>
      <div className="flex flex-col gap-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center flex-wrap gap-2"
          >
            <span className={`text-sm sm:text-base font-medium ${item.color}`}>
              {item.label}
            </span>

            <span
              className={`  text-sm sm:text-base font-semibold ${item.color}`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueCard;
