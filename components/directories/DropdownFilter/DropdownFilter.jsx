"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './DropdownFilter.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'

export function DropdownFilter({ label, options, selectedValues, onChange, placeholder = "Выберите...", grouped = false, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const dropdownHeight = Math.min(options.length * 40 + 16, 300)
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top

      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow)
    }
  }, [isOpen, options.length])

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  const selectedCount = selectedValues.length

  // Get selected items for chips
  const selectedItems = options.filter(opt => selectedValues.includes(opt.value))

  const removeChip = (e, value) => {
    e.stopPropagation()
    onChange(selectedValues.filter(v => v !== value))
  }

  // Group options by group field if grouped is true
  const groupedOptions = grouped
    ? options.reduce((acc, option) => {
      const group = option.group || 'Без группы'
      if (!acc[group]) acc[group] = []
      acc[group].push(option)
      return acc
    }, {})
    : { 'all': options }

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(styles.button, disabled && styles.disabled)}
        disabled={disabled}
      >
        <div className={styles.buttonContent}>
          {selectedCount > 0 ? (
            <div className={styles.chipsContainer}>
              {selectedItems.map((item) => (
                <span key={item.value} className={styles.chip}>
                  {item.label}
                  <span
                    onClick={(e) => removeChip(e, item.value)}
                    className={styles.chipRemove}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        removeChip(e, item.value)
                      }
                    }}
                  >
                    <svg className={styles.chipRemoveIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <span className={cn(styles.buttonText, styles.empty)}>{placeholder}</span>
          )}
        </div>
        <svg
          className={cn(styles.buttonIcon, isOpen && styles.open)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            styles.dropdown,
            openUpward ? styles.openUpward : styles.openDownward
          )}
        >
          <div className={styles.dropdownContent}>
            {Object.entries(groupedOptions).map(([groupName, groupItems]) => (
              <div key={groupName} className={styles.group}>
                {grouped && (
                  <div className={styles.groupHeader}>
                    {groupName}
                  </div>
                )}
                <div className='flex flex-col items-start gap-3'>
                  {groupItems.map((option) => (
                    <OperationCheckbox
                      key={option.value}
                      checked={selectedValues.includes(option.value)}
                      onChange={() => toggleOption(option.value)}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
