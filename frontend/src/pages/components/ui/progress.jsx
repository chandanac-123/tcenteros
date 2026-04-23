import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@pages/lib/utils'

const Progress = React.forwardRef(
  ({ className, value, trackClassName, indicatorClassName, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-transparent/5',
        trackClassName, // override track color if passed
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          'h-full w-full flex-1 bg-primary transition-all',
          indicatorClassName // override progress color if passed
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
)

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
