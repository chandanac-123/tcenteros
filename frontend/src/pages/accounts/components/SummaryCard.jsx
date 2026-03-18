const SummaryCard = ({
  title,
  amount,
  currency = '₹',
  colorTheme
}) => {
  return (
    <div
      className={`flex flex-col w-40 items-center gap-2 border border-tab_bg rounded-lg py-2 `}
    >
      <span className={`text-sm font-medium text-muted-foreground `}>
        {title}
      </span>
      <span
        className={`flex border-2 border-dotted px-6 py-1 rounded-lg font-semibold ${colorTheme}`}
      >
        {currency} {amount}
      </span>
    </div>
  )
}

export default SummaryCard
