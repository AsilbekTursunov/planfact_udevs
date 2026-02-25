"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './MultiSelect.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import { ChevronDown } from 'lucide-react'

export function MultiSelect({
  data = [],
  value = [], // Array of selected values
  onChange,
  placeholder = "Выберите...",
  labelKey = 'label',
  valueKey = 'guid',
  className = "",
  disabled = false,
  loading = false,
  hideSelectAll = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter data by search
  const filteredData = data.filter(item =>
    item[labelKey]?.toLowerCase().includes(search.toLowerCase())
  )

  // Check if data is empty
  const isEmpty = filteredData.length === 0

  // Get selected items labels
  const getSelectedLabel = () => {
    if (value.length === 0) return placeholder
    if (value.length === 1) {
      const item = data.find(item => item[valueKey] === value[0])
      return item ? item[labelKey] : placeholder
    }
    return `Выбрано: ${value.length}`
  }

  const handleToggle = (itemValue) => {
    const newValue = value.includes(itemValue)
      ? value.filter(v => v !== itemValue)
      : [...value, itemValue]
    onChange?.(newValue)
  }

  const handleSelectAll = () => {
    if (value.length === filteredData.length) {
      onChange([])
    } else {
      onChange(filteredData.map(item => item[valueKey]))
    }
  }

  const isAllSelected = filteredData.length > 0 && value.length === filteredData.length

  return <>
    <div className={cn(styles.container, className)} ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          styles.button,
          disabled || loading ? styles.disabled : styles.enabled,
          value.length === 0 && styles.empty
        )}
      >
        <div className={`${styles.buttonContent} line-clamp-1`}>
          <span className={`${styles.buttonText}`}>{loading ? "Загрузка..." : getSelectedLabel()}</span>
          <ChevronDown className={cn(styles.buttonIcon, isOpen && styles.open)} />
        </div>
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {/* Search input */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className={styles.searchInput}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSearch('')
                }}
                className={styles.searchClearButton}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>

          {/* Select All */}
          {filteredData.length > 0 && !hideSelectAll && (
            <div className={styles.selectAllContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxCustom}>
                  {isAllSelected && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={styles.checkboxText}>Выбрать все</span>
              </label>
            </div>
          )}

          {/* Options list */}
          <div className={styles.optionsList}>
            {isEmpty ? (
              <div className={styles.emptyState}>
                Ничего не найдено
              </div>
            ) : (
              filteredData.map((item, index) => (
                <div key={item[valueKey] || `group-${item.group}-${index}`} className={styles.checkboxLabel}>
                  {item.value ? (
                    <OperationCheckbox
                      key={item[valueKey]}
                      checked={value.includes(item[valueKey])}
                      onChange={() => handleToggle(item[valueKey])}
                      label={item[labelKey]}
                    />
                  ) : (
                    <p
                      className={styles.categoryLabel}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const groupChildren = filteredData.filter(
                          child => child.group === item.group && child[valueKey]
                        )
                        const childValues = groupChildren.map(c => c[valueKey])
                        const allSelected = childValues.every(v => value.includes(v))
                        if (allSelected) {
                          onChange?.(value.filter(v => !childValues.includes(v)))
                        } else {
                          onChange?.([...new Set([...value, ...childValues])])
                        }
                      }}
                    >
                      {item.label}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  </>
}
