"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import ReactDatePicker from 'react-datepicker'
import { ru } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/datepicker.css'
import styles from './DatePicker.module.scss'
import { cn } from '@/app/lib/utils'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import { ExclamationIcon } from '../../../constants/icons'

export function DatePicker({ value, onChange, placeholder = 'Выберите дату', showCheckbox = false, checkboxLabel = '', checkboxValue = false, onCheckboxChange, className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0, ready: false })
  const datePickerRef = useRef(null)
  const containerRef = useRef(null)

  // Convert string date to Date object
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : null

  // Format date for display (DD.MM.YYYY)
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(formatDate(dateValue))
  }, [value])

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

  const handleDateChange = (date) => {
    if (date) {
      // Convert to YYYY-MM-DD format for form
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      onChange(`${year}-${month}-${day}`)
    } else {
      onChange('')
    }
    setIsOpen(false)
  }

  const handleInputChange = (e) => {
    let newValue = e.target.value

    // Remove all non-digit characters
    const digitsOnly = newValue.replace(/\D/g, '')

    // Auto-format as user types
    let formatted = ''
    if (digitsOnly.length > 0) {
      // Add day (first 2 digits)
      formatted = digitsOnly.substring(0, 2)

      if (digitsOnly.length >= 3) {
        // Add dot and month
        formatted += '.' + digitsOnly.substring(2, 4)
      }

      if (digitsOnly.length >= 5) {
        // Add dot and year
        formatted += '.' + digitsOnly.substring(4, 8)
      }
    }

    setInputValue(formatted)

    // Try to parse the complete date (DD.MM.YYYY)
    if (digitsOnly.length === 8) {
      const day = parseInt(digitsOnly.substring(0, 2), 10)
      const month = parseInt(digitsOnly.substring(2, 4), 10)
      const year = parseInt(digitsOnly.substring(4, 8), 10)

      // Validate date
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const date = new Date(year, month - 1, day)
        // Check if date is valid (e.g., not 31.02.2024)
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          // Convert to YYYY-MM-DD format
          const formattedYear = date.getFullYear()
          const formattedMonth = String(date.getMonth() + 1).padStart(2, '0')
          const formattedDay = String(date.getDate()).padStart(2, '0')
          onChange(`${formattedYear}-${formattedMonth}-${formattedDay}`)
        }
      }
    } else if (formatted === '') {
      onChange('')
    }
  }

  const handleInputBlur = () => {
    // Reformat input value on blur
    if (dateValue) {
      setInputValue(formatDate(dateValue))
    } else {
      setInputValue('')
    }
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={cn(styles.inputWrapper, className)}>
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          className={styles.input}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        <button
          type="button"
          className={styles.calendarButton}
          onClick={() => setIsOpen(!isOpen)}
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
          className={styles.pickerWrapper}
          style={{
            position: 'fixed',
            top: `${pickerPosition.top}px`,
            left: `${pickerPosition.left}px`,
            zIndex: 9999
          }}
        >
          <ReactDatePicker
            ref={datePickerRef}
            selected={dateValue}
            onChange={handleDateChange}
            onClickOutside={() => setIsOpen(false)}
            locale={ru}
            inline
            dateFormat="dd.MM.yyyy"
            calendarClassName={styles.calendar}
          />
        </div>,
        document.body
      )}
    </div>
  )
}
