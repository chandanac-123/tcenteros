import * as React from "react"

import { cn } from "@pages/lib/utils"

const Textarea = React.forwardRef(({ className, label, labelClassName = '', id, ...props }, ref) => {
  // Generate id if not provided for label association
  const textareaId = id || React.useId();
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className={cn("block mb-1 text-sm font-normal text-textblack", labelClassName)}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
})
Textarea.displayName = "Textarea"

export { Textarea }
