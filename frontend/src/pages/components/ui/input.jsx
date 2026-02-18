import * as React from "react"
import { cn } from "@pages/lib/utils"

const Input = React.forwardRef(
  (
    {
      className,
      type,
      icon,
      iconPosition = "start", // 'start' or 'end'
      label,
      error,
      ...props
    },
    ref
  ) => {
    const hasIcon = !!icon;
    return (
      <div>
        {label && (
          <label className="block mb-1 text-sm font-normal text-textblack">
            {label}
          </label>
        )}
        {hasIcon ? (
          <div className="flex items-center relative rounded-lg border border-bordergreylight">
            {iconPosition === "start" && (
              <span className="absolute left-3 flex items-center text-gray-400">
                {icon}
              </span>
            )}
            <input
              type={type}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                iconPosition === "start" ? "pl-10" : "pr-10",
                className
              )}
              ref={ref}
              {...props}
            />
            {iconPosition === "end" && (
              <span className="absolute right-3 flex items-center text-gray-400">
                {icon}
              </span>
            )}
          </div>
        ) : (
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className
            )}
            ref={ref}
            {...props}
          />
        )}
        {error && <div className="text-xs text-red-500">{error}</div>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };