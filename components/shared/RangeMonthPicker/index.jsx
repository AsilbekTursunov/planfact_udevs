"use client"
import { useState } from "react";
import DatePicker from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import { cn } from "@/app/lib/utils";

import './month-picker.scss'
import { Calendar } from "lucide-react"; 

const RangeMonthPicker = ({ value, onChange, format = "MMMM, YYYY", className, ...props }) => {
  const [state, setState] = useState([
    { year: 2026, month: 1 },
    { year: 2026, month: 2 },
  ]);
  return (
    <div className={cn("month_picker_wrapper gap-1", className)}>
      <Calendar className="date-picker-icon text-gray-ucode-500" />
      <DatePicker 
        onlyMonthPicker
        range
        format={format}
        value={value || state}
        onChange={onChange || setState}
        plugins={[<DatePanel key="date-panel" />]}
        {...props}
      />
    </div>
  )
}

export default RangeMonthPicker