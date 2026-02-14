import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@pages/components/ui/carousel'

export function CarouselSize ({ children }) {
  return (
    <Carousel opts={{ align: 'start' }} className='w-full relative'>
      <CarouselContent>
        {React.Children.map(children, (child, index) => (
          <CarouselItem
            key={index}
            className='basis-full sm:basis-1/2 lg:basis-1/4'
          >
            <div className='p-2'>{child}</div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className='flex justify-center gap-4 mt-4'>
        <CarouselPrevious className='left-0' />
        <CarouselNext className='right-0' />
      </div>
    </Carousel>
  )
}
