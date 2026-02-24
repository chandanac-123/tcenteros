import { LoaderIcon } from 'lucide-react'

import { cn } from '@pages/lib/utils'

function Spinner ({ className, ...props }) {
  return (
    <LoaderIcon
      role='status'
      aria-label='Loading'
      className={cn('size-6 animate-spin text-primary', className)}
      {...props}
    />
  )
}

export { Spinner }
