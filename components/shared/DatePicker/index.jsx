import DatePicker from "react-multi-date-picker"
import './style.scss'
import { Calendar } from "lucide-react";

export default function CustomDatePicker({ value, onChange, format = "DD MMM, YYYY", ...props }) {
  return (
    <div className="date_picker_wrapper">
      <DatePicker
        value={value || new Date()}
        format={format}
        onChange={(dataObj => onChange(dataObj.format(format)))}
        {...props}
      />
      <Calendar className="date-picker-icon" />
    </div>
  );
}