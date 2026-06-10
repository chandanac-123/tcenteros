const CustomeVerticalSelect = ({
  children,
  options = [],
  selected,
  onSelect,
  heading,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {options.map((opt) => (
            <button
              key={opt?.id}
              type="button"
              onClick={() => onSelect?.(opt?.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selected === opt?.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-textblack"
              }`}
            >
              {opt?.name}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex py-4 flex-col gap-2 w-56 pr-4 border-r border-gray-300">
        {options.map((opt) => (
          <button
            key={opt?.id}
            type="button"
            onClick={() => onSelect?.(opt?.id)}
            className={`text-left p-3 transition-all rounded-l-lg font-medium text-base ${
              selected === opt?.id
                ? "bg-primary/10 text-primary border-r-8 border-primary"
                : "hover:bg-primary/10 text-textblack"
            }`}
          >
            {opt?.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 pt-2 lg:pt-4 px-0 lg:px-4 min-w-0">
        <h2 className="font-semibold text-base sm:text-lg mb-4">
          {heading}
        </h2>

        <div className="w-full overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomeVerticalSelect;