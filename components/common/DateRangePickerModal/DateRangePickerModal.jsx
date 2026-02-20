"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import styles from './DateRangePickerModal.module.scss'

export function DateRangePickerModal({ 
  selectedRange,
  onChange,
  placeholder = "Указать период"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeInput, setActiveInput] = useState(null)
  const [tempStartDate, setTempStartDate] = useState(null)
  const [tempEndDate, setTempEndDate] = useState(null)
  const [openUpward, setOpenUpward] = useState(false) // Всегда открываем вниз
  const [mounted, setMounted] = useState(false)
  
  const pickerRef = useRef(null)
  const modalRef = useRef(null)
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)
  const justOpenedRef = useRef(false)

  // Mount check for portal
  useEffect(() => {
    setMounted(true)
  }, [])

  const quickDateRanges = [
    { label: 'Просроченные', getValue: () => ({ start: new Date(2025, 0, 1), end: new Date() }) },
    { label: 'Вчера', getValue: () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return { start: yesterday, end: yesterday }
    }},
    { label: 'Прошлая неделя', getValue: () => ({ start: new Date(2026, 0, 5), end: new Date(2026, 0, 11) }) },
    { label: 'Прошлый месяц', getValue: () => ({ start: new Date(2025, 11, 1), end: new Date(2025, 11, 31) }) },
    { label: 'Прошлый квартал', getValue: () => ({ start: new Date(2025, 9, 1), end: new Date(2025, 11, 31) }) },
    { label: 'Прошлый год', getValue: () => ({ start: new Date(2025, 0, 1), end: new Date(2025, 11, 31) }) },
    { label: 'Будущие', getValue: () => ({ start: new Date(), end: new Date(2026, 11, 31) }) },
    { label: 'Сегодня', getValue: () => {
      const today = new Date()
      return { start: today, end: today }
    }},
    { label: 'Эта неделя', getValue: () => ({ start: new Date(2026, 0, 12), end: new Date(2026, 0, 18) }) },
    { label: 'Этот месяц', getValue: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 0, 31) }) },
    { label: 'Этот квартал', getValue: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 2, 31) }) },
    { label: 'Этот год', getValue: () => ({ start: new Date(2026, 0, 1), end: new Date(2026, 11, 31) }) }
  ]

  const closeModal = useCallback(() => {
    setTimeout(() => {
      setIsModalOpen(false)
      setActiveInput(null)
      setTempStartDate(null)
      setTempEndDate(null)
    }, 200)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (justOpenedRef.current) {
        justOpenedRef.current = false
        return
      }

      if (isModalOpen) {
        const clickedInsideButton = pickerRef.current?.contains(event.target)
        const clickedInsideModal = modalRef.current?.contains(event.target)
        if (!clickedInsideButton && !clickedInsideModal) {
          closeModal()
        }
      }
    }

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen, closeModal])

  const formatDateRange = (range) => {
    if (!range) return null
    return `${range.start.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}–${range.end.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
  }

  const handleQuickRangeClick = (range) => {
    const dateRange = range.getValue()
    onChange(dateRange)
    closeModal()
  }

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      onChange({ start: tempStartDate, end: tempEndDate })
    }
    closeModal()
  }

  const handleReset = () => {
    setTempStartDate(null)
    setTempEndDate(null)
    // Reset to default range (last 6 months) instead of null
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    onChange({ start, end })
    closeModal()
  }

  const handleOpenModal = () => {
    if (!isModalOpen) {
      justOpenedRef.current = true
      setIsModalOpen(true)
      if (selectedRange) {
        setTempStartDate(selectedRange.start)
        setTempEndDate(selectedRange.end)
      } else {
        setTempStartDate(null)
        setTempEndDate(null)
      }
      setActiveInput(null)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.datePickerButton} ref={pickerRef}>
        <button 
          onClick={(e) => {
            e.stopPropagation()
            handleOpenModal()
          }}
          className={styles.datePickerButtonInner}
        >
          <svg className={styles.datePickerIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_1_53706)">
              <path d="M12 1.33325V2.66659M4 1.33325V2.66659" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.6665 8.16216C1.6665 5.25729 1.6665 3.80486 2.50125 2.90243C3.336 2 4.6795 2 7.3665 2H8.63317C11.3202 2 12.6637 2 13.4984 2.90243C14.3332 3.80486 14.3332 5.25729 14.3332 8.16216V8.5045C14.3332 11.4094 14.3332 12.8618 13.4984 13.7642C12.6637 14.6667 11.3202 14.6667 8.63317 14.6667H7.3665C4.6795 14.6667 3.336 14.6667 2.50125 13.7642C1.6665 12.8618 1.6665 11.4094 1.6665 8.5045V8.16216Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 5.33325H14" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_1_53706">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          {selectedRange ? formatDateRange(selectedRange) : placeholder}
        </button>
      </div>

      {mounted && isModalOpen && createPortal(
            <div 
              ref={modalRef}
              className={cn(
                styles.datePickerModal,
                openUpward ? styles.openUpward : ''
              )}
              style={{ 
                top: (() => {
                  if (!pickerRef.current) {
                    return '100px'
                  }
                  const buttonRect = pickerRef.current.getBoundingClientRect()
                  // Открываем модалку ниже кнопки с отступом 8px
                  const topPos = buttonRect.bottom + 8
                  return topPos + 'px'
                })(),
                left: (() => {
                  if (!pickerRef.current) return '100px'
                  const buttonRect = pickerRef.current.getBoundingClientRect()
                  // Позиционируем справа от кнопки с отступом 8px
                  const leftPos = (buttonRect.right + 8) + 'px'
                  return leftPos
                })(),
                width: '400px',
                maxHeight: '500px'
              }}
            >
              <div className={styles.datePickerModalContent}>
                <div className={styles.datePickerModalBody}>
                  <div className={styles.quickRanges}>
                    {quickDateRanges.map((range, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickRangeClick(range)}
                        className={styles.quickRangeButton}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.dateInputs}>
                  <button
                    ref={startInputRef}
                    onClick={() => setActiveInput(activeInput === 'start' ? null : 'start')}
                    className={cn(
                      styles.dateInput,
                      activeInput === 'start' ? styles.active : styles.inactive
                    )}
                  >
                    <svg className={styles.dateInputIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_2_55889)">
                        <path d="M12 1.33325V2.66659M4 1.33325V2.66659" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.66675 8.16216C1.66675 5.25729 1.66675 3.80486 2.50149 2.90243C3.33624 2 4.67974 2 7.36675 2H8.63341C11.3204 2 12.6639 2 13.4987 2.90243C14.3334 3.80486 14.3334 5.25729 14.3334 8.16216V8.5045C14.3334 11.4094 14.3334 12.8618 13.4987 13.7642C12.6639 14.6667 11.3204 14.6667 8.63341 14.6667H7.36675C4.67974 14.6667 3.33624 14.6667 2.50149 13.7642C1.66675 12.8618 1.66675 11.4094 1.66675 8.5045V8.16216Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 5.33325H14" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_2_55889">
                          <rect width="16" height="16" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span className={styles.dateInputText}>
                      {tempStartDate ? tempStartDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Начало периода'}
                    </span>
                  </button>
                  <span className={styles.dateInputSeparator}>—</span>
                  <button
                    ref={endInputRef}
                    onClick={() => setActiveInput(activeInput === 'end' ? null : 'end')}
                    className={cn(
                      styles.dateInput,
                      activeInput === 'end' ? styles.active : styles.inactive
                    )}
                  >
                    <svg className={styles.dateInputIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_2_55889_end)">
                        <path d="M12 1.33325V2.66659M4 1.33325V2.66659" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1.66675 8.16216C1.66675 5.25729 1.66675 3.80486 2.50149 2.90243C3.33624 2 4.67974 2 7.36675 2H8.63341C11.3204 2 12.6639 2 13.4987 2.90243C14.3334 3.80486 14.3334 5.25729 14.3334 8.16216V8.5045C14.3334 11.4094 14.3334 12.8618 13.4987 13.7642C12.6639 14.6667 11.3204 14.6667 8.63341 14.6667H7.36675C4.67974 14.6667 3.33624 14.6667 2.50149 13.7642C1.66675 12.8618 1.66675 11.4094 1.66675 8.5045V8.16216Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 5.33325H14" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_2_55889_end">
                          <rect width="16" height="16" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <span className={styles.dateInputText}>
                      {tempEndDate ? tempEndDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Конец периода'}
                    </span>
                  </button>
                </div>

                <div className={styles.datePickerActions}>
                  <button
                    onClick={handleReset}
                    className={cn(styles.datePickerActionButton, styles.cancel)}
                  >
                    Сбросить
                  </button>
                  <button
                    onClick={handleApply}
                    className={cn(styles.datePickerActionButton, styles.apply)}
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
    </div>
  )
}
