import { useState } from "react"
import CustomDatePicker from "@common/CustomeDatepicker"
import TimePicker from "@common/Timepicker"

const CenterOperations = () => {
   const [date, setDate] = useState(null)
   const [time, setTime] = useState("")
  return <div>CenterOperations
    <TimePicker  value={time} onChange={setTime}/>
    <CustomDatePicker value={date} onChange={setDate} />
  </div>
}

export default CenterOperations