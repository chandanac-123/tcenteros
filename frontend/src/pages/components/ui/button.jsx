import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '@pages/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-white rounded-xl hover:bg-primary/90 font-roboto font-medium text-md justify-between',
        outline_primary:
          'border border-input  text-primary border-primary bg-primarybglight font-medium justify-between',
        outline_secondary:
          'border border-input text-grey border-grey  font-medium justify-between',
        button_filled: 'bg-primary text-white',
        button_outlined: ' text-primary outline ',

        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 pl-4 pr-1 rounded-xl text-md gap-20',
        landing: 'h-10 pl-4 pr-1 rounded-xl text-md gap-40',
        sm: 'h-10 rounded-lg pr-4 pl-1 text-md gap-20',

        googlebutton: 'h-10 pl-4 pr-1 rounded-lg text-md gap-2',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      leftIcon,
      rightIcon,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        {...props}
      >
        {leftIcon && (
          <img
            src={leftIcon}
            className={cn(
              'flex items-center',
              size === 'googlebutton' ? 'w-6' : 'w-8'
            )}
          />
        )}
        {children}
        {rightIcon && <img src={rightIcon} className='flex items-center w-8' />}
      </button>
    )
  }
)

export { Button, buttonVariants }
