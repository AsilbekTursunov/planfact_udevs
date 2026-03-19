"use client"

import { useState, useRef, useEffect } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import '@/styles/datepicker.css'
import styles from './DatePicker.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import CustomDatePicker from '../../shared/DatePicker'

export function DatePicker({ value, onChange, placeholder = 'Выберите дату', showCheckbox = false, checkboxLabel = '', checkboxValue = false, onCheckboxChange, disabled = false, checkboxDisabled = false, className, dateFormat = 'DD.MM.YYYY' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0, ready: false })
  const datePickerRef = useRef(null)
  const containerRef = useRef(null)
  const pickerRef = useRef(null)

  // Convert string date to Date object
  const dateValue = value ? (typeof value === 'string' ? new Date(value) : value) : ''

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
      <div className='w-44'>
        <CustomDatePicker
          ref={datePickerRef}
          value={dateValue}
          format={dateFormat}
          onChange={handleDateChange}
          disabled={disabled}
        />
      </div>
      {showCheckbox && (
        <OperationCheckbox
          checked={checkboxValue}
          onChange={(e) => onCheckboxChange?.(e.target.checked)}
          label={checkboxLabel}
          disabled={disabled || checkboxDisabled}
        />
      )}
    </div>
  )
}
