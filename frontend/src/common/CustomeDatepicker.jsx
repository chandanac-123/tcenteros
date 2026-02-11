import { format } from 'date-fns'
import { Button } from "@pages/components/ui/button"
import { Calendar } from "@pages/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@pages/components/ui/popover"
import { ChevronDownIcon } from "lucide-react"
import { useState } from "react"

const CustomDatePicker = ({ value, onChange }) => {
  const [date, setDate] =useState()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-[212px] justify-between text-left font-normal"
        >
          {date ? format(date, "PPP") : <span>Pick a date</span>}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}


export default CustomDatePicker
