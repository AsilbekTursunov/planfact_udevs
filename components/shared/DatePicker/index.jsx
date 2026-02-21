import DatePicker from "react-multi-date-picker"
import './style.scss'
import { DesignCalenderIcon } from "../../../constants/icons";

export default function CustomDatePicker({ value, onChange, format = "DD MMM, YYYY", ...props }) {
  return (
    <div className="date_picker_wrapper">
      <DesignCalenderIcon />
      <DatePicker
        value={value || new Date()}
        format={format}
        onChange={onChange}
      on
        {...props}
      />
    </div>
  );
}