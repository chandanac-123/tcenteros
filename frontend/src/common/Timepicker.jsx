import { useState } from "react"
import { Button } from "@pages/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@pages/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pages/components/ui/select"

const hours = Array.from({ length: 12 }, (_, i) => i + 1)
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
)

const TimePicker = ({ value, onChange }) => {
  const [hour, setHour] = useState("12")
  const [minute, setMinute] = useState("00")
  const [period, setPeriod] = useState("AM")

  const handleChange = (h, m, p) => {
    const time = `${h}:${m} ${p}`
    onChange?.(time)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-40 justify-start">
          {value || "Select Time"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-4">
        <div className="flex gap-2">
          
          {/* Hour */}
          <Select
            value={hour}
            onValueChange={(val) => {
              setHour(val)
              handleChange(val, minute, period)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Hour" />
            </SelectTrigger>
            <SelectContent>
              {hours.map((h) => (
                <SelectItem key={h} value={h.toString()}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Minute */}
          <Select
            value={minute}
            onValueChange={(val) => {
              setMinute(val)
              handleChange(hour, val, period)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Min" />
            </SelectTrigger>
            <SelectContent className="h-60">
              {minutes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* AM / PM */}
          <Select
            value={period}
            onValueChange={(val) => {
              setPeriod(val)
              handleChange(hour, minute, val)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="AM/PM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AM">AM</SelectItem>
              <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default TimePicker