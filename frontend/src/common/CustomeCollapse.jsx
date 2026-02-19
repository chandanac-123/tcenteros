'use client'

import * as React from 'react'
import { Button } from '@pages/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@pages/components/ui/collapsible'
import {
  ChevronsUpDown,
  ListChevronsDownUp,
  ListChevronsUpDown
} from 'lucide-react'

export function CustomeCollapse ({ children, label }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className='flex  flex-col gap-2'
    >
      <div className='flex items-center justify-between gap-4 px-4'>
        <h4 className='text-sm font-semibold'>{label}</h4>
        <CollapsibleTrigger asChild>
          <button>
            {isOpen ? (
              <ListChevronsDownUp className='text-primary' />
            ) : (
              <ListChevronsUpDown className='text-primary' />
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className='flex flex-col gap-2'>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
