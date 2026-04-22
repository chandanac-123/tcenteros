import * as React from 'react'
import { cva } from 'class-variance-authority'

import { cn } from '@pages/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        active:
          'bg-badge_bg_green border-none text-green_text rounded-lg text-xs font-medium px-3 justify-center py-1 w-32',
        inactive:
          'bg-red_bg border-none text-red_text rounded-lg text-xs font-medium justify-center w-32 px-3 py-1',
        pending:
          'bg-yellow/25 border-none text-yellow rounded-lg text-xs font-medium justify-center w-32 px-3 py-1',
        future_lead:
          'bg-plan_bg_purple border-none  text-plan_purple  rounded-lg text-xs font-medium justify-center w-32 px-3 py-1',
        follow_up:
          'bg-badge_blue_bg border-none  text-badge_blue rounded-lg  text-xs font-medium justify-center w-32 px-3 py-1',
        suspended:
          'bg-[#E6E7E7] border-none  text-[#757775] rounded-lg  text-xs font-medium justify-center w-32 px-3 py-1'
      }
    },
    defaultVariants: {
      variant: 'active'
    }
  }
)

function Badge ({ className, label, variant,selected, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {label}
    </div>
  )
}

export { Badge, badgeVariants }
