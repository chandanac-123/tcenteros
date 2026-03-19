import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@pages/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, error, ...props }, ref) => (
  <div className="flex flex-col">
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-secondary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-onboard_secondary data-[state=checked]:text-primary-foreground",
        className,
        error ? 'border-red-500' : ''
      )}
      checked={!!checked}
      onCheckedChange={val => onCheckedChange?.(!!val)}
      {...props}>
      <CheckboxPrimitive.Indicator className={cn("grid place-content-center text-current")}> 
        <Check className="h-4 w-4 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {error && (
      <span className="text-xs text-red-500 mt-1">{error}</span>
    )}
  </div>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
