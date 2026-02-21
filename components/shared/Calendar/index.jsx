import { Calendar } from "react-multi-date-picker"
import './calendar.scss'

export default function CustomCalendar({ value, onChange, format = "DD MMM, YYYY", ...props }) {
  return (
    <div className="calendar_wrapper">
      <Calendar
        value={value || new Date()} 
        onChange={onChange}
        format={format}
        {...props}
      />
    </div>
  )
}