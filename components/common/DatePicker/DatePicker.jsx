"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/datepicker.css'
import styles from './DatePicker.module.scss'
import { cn } from '@/app/lib/utils'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import CustomCalendar from '../../shared/Calendar'

export function DatePicker({ value, onChange, placeholder = 'Выберите дату', showCheckbox = false, checkboxLabel = '', checkboxValue = false, onCheckboxChange, className, dateFormat = 'DD.MM.YYYY' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0, ready: false })
  const datePickerRef = useRef(null)
  const containerRef = useRef(null)
  const pickerRef = useRef(null)

  // Convert string date to Date object
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : null

  // Format date for display (DD.MM.YYYY)


  // Update picker position when opened
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const pickerHeight = 350 // Approximate height of the calendar

      // Check if there's enough space below
      const spaceBelow = viewportHeight - rect.bottom
      const shouldOpenAbove = spaceBelow < pickerHeight && rect.top > spaceBelow

      setPickerPosition({
        top: shouldOpenAbove ? rect.top - pickerHeight - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        ready: true
      })
    } else {
      setPickerPosition(prev => ({ ...prev, ready: false }))
    }
  }, [isOpen])

  // // Close calendar on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        pickerRef.current && !pickerRef.current.contains(e.target)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleDateChange = (date) => {
    console.log('date', date)
    if (date) {
      onChange(date)
      setInputValue(date)
    } else {
      onChange('')
    }
    setIsOpen(false)
  }


  return (
    <div className={styles.container} ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className={cn(styles.inputWrapper, className)}>
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          className={styles.input}
        />
        <button
          type="button"
          className={styles.calendarButton}
        >
          <svg className={styles.calendarIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* <div>
        <ExclamationIcon />
      </div> */}

      {showCheckbox && (
        <OperationCheckbox
          checked={checkboxValue}
          onChange={(e) => onCheckboxChange?.(e.target.checked)}
          label={checkboxLabel}
        />
      )}

      {isOpen && pickerPosition.ready && typeof document !== 'undefined' && createPortal(
        <div
          ref={pickerRef}
          className={styles.pickerWrapper}
          style={{
            position: 'fixed',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 9999
          }}
        >
          <CustomCalendar
            ref={datePickerRef}
            value={dateValue}
            format={dateFormat}
            onChange={handleDateChange}
          />
          {/* <ReactDatePicker
            ref={datePickerRef}
            selected={dateValue}
            onChange={handleDateChange}
            onClickOutside={() => setIsOpen(false)}
            locale={ru}
            inline
            dateFormat="dd.MM.yyyy"
            calendarClassName={styles.calendar}
          /> */}
        </div>,
        document.body
      )}
    </div>
  )
}
