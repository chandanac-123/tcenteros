import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@pages/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        onboard_default:
          'bg-onboard_primary text-white rounded-xl hover:bg-onboard_primary/90 font-roboto font-medium text-md justify-between',
        default:
          'bg-primary text-white rounded-xl hover:bg-primary/90 font-roboto font-medium text-md justify-between',
        outline_primary:
          'border border-input  text-primary border-primary bg-primary/10 font-medium justify-between',
        onboard_outline_primary:
          'border border-input  text-onboard_primary border-onboard_primary bg-onboard_primary/10 font-medium justify-between',
        outline_secondary:
          'border border-input text-grey border-grey  font-medium justify-between',
        button_filled: 'bg-primary text-white',
        onboard_button_filled: 'bg-onboard_primary text-white',
        button_outlined: ' text-primary outline ',
        button_outlined_textleft: 'text-primary outline justify-start',
        button_filter: 'text-textgrey border-2 border-filter_border',
        link: 'text-primary underline-offset-4 underline',
        danger:'text-white bg-[#D50A0A] px-2 py-1',
      },
      size: {
        default: 'h-10 pl-4 pr-1 rounded-xl text-md gap-16',
        landing: 'h-10 pl-4 pr-1 rounded-xl text-md gap-40',
        sm: 'h-10 rounded-lg pr-4 pl-1 text-md gap-20',
        filterbutton: 'h-9 p-2 rounded-lg text-md gap-2',
        addbutton: 'h-10 px-6 rounded-lg text-sm gap-2',
        editbutton: 'h-9 w-20 px-4 rounded-2xl text-sm gap-2',
        icon: 'h-9 w-9',
        notificationbutton: 'h-6 px-3 rounded-lg text-xs gap-1',
        mini: 'h-9 px-3 rounded-lg text-sm gap-1',
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
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={onClick}
        {...props}
      >
        {leftIcon && <img src={leftIcon} alt='' loading="lazy" className='flex items-center w-8' />}
        {children}
        {rightIcon && <img src={rightIcon} alt='' loading="lazy" className='flex items-center w-8' />}
      </button>
    )
  }
)

export { Button, buttonVariants }
