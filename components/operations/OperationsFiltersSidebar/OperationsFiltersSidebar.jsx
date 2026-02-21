"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/app/lib/utils'
import styles from './OperationsFiltersSidebar.module.scss'

export function OperationsFiltersSidebar({ 
  isOpen, 
  onClose,
  selectedFilters,
  onFilterChange,
  dateFilters,
  onDateFilterChange,
  dateStartFilters,
  onDateStartFilterChange,
  selectedDatePaymentRange,
  onDatePaymentRangeChange,
  selectedDateStartRange,
  onDateStartRangeChange,
  legalEntities,
  selectedLegalEntities,
  onLegalEntityToggle,
  onSelectAllLegalEntities,
  counterAgents,
  selectedCounterAgents,
  onCounterAgentToggle,
  onSelectAllCounterAgents
}) {
  const [activeTab, setActiveTab] = useState('general') // 'general' или 'quick'
  const [isDatePaymentModalOpen, setIsDatePaymentModalOpen] = useState(false)
  const [isDateStartModalOpen, setIsDateStartModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0))
  const [currentMonthStart, setCurrentMonthStart] = useState(new Date(2026, 0))
  const [activeInput, setActiveInput] = useState(null)
  const [activeInputStart, setActiveInputStart] = useState(null)
  const [tempStartDate, setTempStartDate] = useState(null)
  const [tempEndDate, setTempEndDate] = useState(null)
  const [tempStartDateStart, setTempStartDateStart] = useState(null)
  const [tempEndDateStart, setTempEndDateStart] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const [openUpward, setOpenUpward] = useState(false)
  const [openUpwardStart, setOpenUpwardStart] = useState(false)
  const [openParameterDropdown, setOpenParameterDropdown] = useState(null)
  const datePickerRef = useRef(null)
  const dateStartPickerRef = useRef(null)
  const datePickerModalRef = useRef(null)
  const dateStartPickerModalRef = useRef(null)
  const calendarPortalRef = useRef(null) // Добавляем ref для календаря
  const parameterDropdownRef = useRef(null)
  const legalEntitiesDropdownRef = useRef(null)
  const counterAgentsDropdownRef = useRef(null)
  const justOpenedRef = useRef(false)
  const justOpenedStartRef = useRef(false)
  const startInputRef = useRef(null)
  const endInputRef = useRef(null)
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Функция для определения направления открытия
  const calculateOpenDirection = useCallback((ref, modalHeight) => {
    if (!ref?.current) return false
    const buttonRect = ref.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    return spaceBelow < modalHeight || (spaceAbove > spaceBelow && spaceAbove > 100)
  }, [])
  
  // Определяем направление открытия для первого выпадающего списка
  useEffect(() => {
    if (isDatePaymentModalOpen && datePickerRef.current) {
      const modalHeight = activeInput ? 400 : 200
      const shouldOpenUpward = calculateOpenDirection(datePickerRef, modalHeight)
      setOpenUpward(shouldOpenUpward)
    }
  }, [isDatePaymentModalOpen, activeInput, calculateOpenDirection])
  
  // Определяем направление открытия для второго выпадающего списка
  useEffect(() => {
    if (isDateStartModalOpen && dateStartPickerRef.current) {
      const modalHeight = activeInputStart ? 400 : 200
      const shouldOpenUpward = calculateOpenDirection(dateStartPickerRef, modalHeight)
      setOpenUpwardStart(shouldOpenUpward)
    }
  }, [isDateStartModalOpen, activeInputStart, calculateOpenDirection])
  
  // Пересчитываем позицию при изменении размера окна или прокрутке
  useEffect(() => {
    const handleResize = () => {
      if (isDatePaymentModalOpen && datePickerRef.current) {
        const modalHeight = activeInput ? 400 : 200
        const shouldOpenUpward = calculateOpenDirection(datePickerRef, modalHeight)
        setOpenUpward(shouldOpenUpward)
      }
      if (isDateStartModalOpen && dateStartPickerRef.current) {
        const modalHeight = activeInputStart ? 400 : 200
        const shouldOpenUpward = calculateOpenDirection(dateStartPickerRef, modalHeight)
        setOpenUpwardStart(shouldOpenUpward)
      }
    }
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
    }
  }, [isDatePaymentModalOpen, isDateStartModalOpen, activeInput, activeInputStart, calculateOpenDirection])

  // Обновление позиции календаря при изменении activeInput
  useEffect(() => {
    if (activeInput && (startInputRef.current || endInputRef.current)) {
      const inputRef = activeInput === 'start' ? startInputRef : endInputRef
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        const calendarHeight = 350 // примерная высота календаря
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        
        // Если снизу недостаточно места, показываем сверху
        if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
          setCalendarPosition({
            top: rect.top - calendarHeight - 8,
            left: rect.left
          })
        } else {
          setCalendarPosition({
            top: rect.bottom + 8,
            left: rect.left
          })
        }
      }
    }
  }, [activeInput])

  // Обработчик клика вне календаря
  useEffect(() => {
    if (!activeInput || !isDatePaymentModalOpen) return

    const handleClickOutsideCalendar = (event) => {
      // Проверяем, что клик был вне календаря и вне кнопок выбора даты
      const clickedInsideCalendar = event.target.closest(`.${styles.calendar}`)
      const clickedInsideDateInput = startInputRef.current?.contains(event.target) || 
                                      endInputRef.current?.contains(event.target)
      
      if (!clickedInsideCalendar && !clickedInsideDateInput) {
        setActiveInput(null)
      }
    }

    // Добавляем небольшую задержку, чтобы избежать немедленного закрытия
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutsideCalendar)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutsideCalendar)
    }
  }, [activeInput, isDatePaymentModalOpen])

  const closeDatePaymentModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsDatePaymentModalOpen(false)
      setIsClosing(false)
      setActiveInput(null)
      setTempStartDate(null)
      setTempEndDate(null)
    }, 200)
  }, [])

  const closeDateStartModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setIsDateStartModalOpen(false)
      setIsClosing(false)
      setActiveInputStart(null)
      setTempStartDateStart(null)
      setTempEndDateStart(null)
    }, 200)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      // Игнорируем клики сразу после открытия
      if (justOpenedRef.current) {
        justOpenedRef.current = false
        return
      }
      if (justOpenedStartRef.current) {
        justOpenedStartRef.current = false
        return
      }

      // Проверяем клик вне модального окна для даты оплаты
      if (isDatePaymentModalOpen) {
        const clickedInsideButton = datePickerRef.current?.contains(event.target)
        const clickedInsideModal = datePickerModalRef.current?.contains(event.target)
        const clickedInsideCalendar = calendarPortalRef.current?.contains(event.target)
        if (!clickedInsideButton && !clickedInsideModal && !clickedInsideCalendar) {
          closeDatePaymentModal()
        }
      }

      // Проверяем клик вне модального окна для даты начала
      if (isDateStartModalOpen) {
        const clickedInsideButton = dateStartPickerRef.current?.contains(event.target)
        const clickedInsideModal = dateStartPickerModalRef.current?.contains(event.target)
        if (!clickedInsideButton && !clickedInsideModal) {
          closeDateStartModal()
        }
      }
      
      // Check for legal entities dropdown
      if (openParameterDropdown === 'legalentities') {
        if (legalEntitiesDropdownRef.current) {
          const clickedInside = legalEntitiesDropdownRef.current.contains(event.target) ||
            event.target.closest(`.${styles.parameterDropdownMenu}`) !== null ||
            event.target.closest(`.${styles.parameterItem}`) !== null ||
            event.target.closest(`.${styles.checkboxWrapper}`) !== null ||
            event.target.type === 'checkbox' ||
            event.target.closest('input[type="checkbox"]') !== null
          
          const button = event.target.closest(`.${styles.parameterDropdownButton}`)
          const isButtonClick = button && legalEntitiesDropdownRef.current.contains(button)
          
          if (!clickedInside && !isButtonClick) {
            setOpenParameterDropdown(null)
          }
        }
      }
      
      // Check for counteragents dropdown
      if (openParameterDropdown === 'counteragents') {
        if (counterAgentsDropdownRef.current) {
          // Check if click was inside the dropdown container (including menu)
          const clickedInside = counterAgentsDropdownRef.current.contains(event.target) ||
            event.target.closest(`.${styles.parameterDropdownMenu}`) !== null ||
            event.target.closest(`.${styles.parameterItem}`) !== null ||
            event.target.closest(`.${styles.checkboxWrapper}`) !== null ||
            event.target.type === 'checkbox' ||
            event.target.closest('input[type="checkbox"]') !== null
          
          // Check if click was on the button that opens the dropdown
          const button = event.target.closest(`.${styles.parameterDropdownButton}`)
          const isButtonClick = button && counterAgentsDropdownRef.current.contains(button)
          
          if (!clickedInside && !isButtonClick) {
            setOpenParameterDropdown(null)
          }
        }
      }
    }
    // Добавляем небольшую задержку перед добавлением обработчика, чтобы избежать немедленного закрытия
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [openParameterDropdown ?? null, isDatePaymentModalOpen ?? false, isDateStartModalOpen ?? false, closeDatePaymentModal, closeDateStartModal])

  const formatDateRange = (range) => {
    if (!range) return null
    return `${range.start?.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}–${range.end?.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
  }

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

  if (!isOpen) return null

  return (
    <>
    <div className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>Фильтры</h2>
          <button 
            onClick={onClose}
            className={styles.sidebarCloseButton}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Табы фильтров */}
        <div className={styles.filterTabs}>
          <button 
            className={cn(styles.filterTab, activeTab === 'general' ? styles.active : styles.inactive)}
            onClick={() => setActiveTab('general')}
          >
            Общие
          </button>
          <button 
            className={cn(styles.filterTab, activeTab === 'quick' ? styles.active : styles.inactive)}
            onClick={() => setActiveTab('quick')}
          >
            Быстрые
          </button>
        </div>

        {/* Контент табов с анимацией */}
        {activeTab === 'general' && (
          <div className={styles.filterContent} key="general">
            {/* Тип операции */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.875rem' }}>
                Тип операции
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </h3>
              
              {/* Начисление */}
          <div className={styles.filterSectionHeader}>
            <label className={styles.checkboxWrapper} style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedFilters.nachisleniye || false}
                onChange={() => onFilterChange('type', 'nachisleniye')}
                className={styles.checkboxInput}
              />
              <div 
                className={cn(
                  styles.checkbox,
                  selectedFilters.nachisleniye && styles.checkboxChecked
                )}
                onClick={(e) => {
                  e.preventDefault()
                  onFilterChange('type', 'nachisleniye')
                }}
                style={{
                  '--checkbox-bg': selectedFilters.nachisleniye ? '#307FE2' : 'white',
                  '--checkbox-border': selectedFilters.nachisleniye ? '#307FE2' : '#d1d5db',
                  '--checkbox-hover-border': '#9ca3af',
                  cursor: 'pointer'
                }}
              >
                {selectedFilters.nachisleniye && (
                  <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </label>
            <span 
              className={styles.filterSectionHeaderTitle}
              onClick={() => onFilterChange('type', 'nachisleniye')}
            >
              Начисление
            </span>
          </div>
          <div className={styles.filterOptions}>
            {[
              { key: 'postupleniye', label: 'Отгрузка' },
              { key: 'vyplata', label: 'Поставка' }
            ].map(item => (
              <label key={item.key} className={styles.filterOption}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[item.key]}
                    onChange={() => onFilterChange('type', item.key)}
                    className={styles.checkboxInput}
                  />
                  <div 
                    className={cn(
                      styles.checkbox,
                      selectedFilters[item.key] && styles.checkboxChecked
                    )}
                    style={{
                      '--checkbox-bg': selectedFilters[item.key] ? '#307FE2' : 'white',
                      '--checkbox-border': selectedFilters[item.key] ? '#307FE2' : '#d1d5db',
                      '--checkbox-hover-border': '#9ca3af'
                    }}
                  >
                    {selectedFilters[item.key] && (
                      <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={styles.filterOptionLabel}>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Дата оплаты - упрощенная версия, полная версия будет в отдельном компоненте */}
        <div className={styles.filterSection}>
          <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
            Дата оплаты
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </h3>
          <div className={styles.filterOptions}>
            {[
              { key: 'podtverzhdena', label: 'Подтверждена' },
              { key: 'nePodtverzhdena', label: 'Не подтверждена' }
            ].map(item => (
              <label key={item.key} className={styles.filterOption}>
                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    checked={dateFilters[item.key]}
                    onChange={() => onDateFilterChange(item.key)}
                    className={styles.checkboxInput}
                  />
                  <div 
                    className={cn(
                      styles.checkbox,
                      dateFilters[item.key] && styles.checkboxChecked
                    )}
                    style={{
                      '--checkbox-bg': dateFilters[item.key] ? '#307FE2' : 'white',
                      '--checkbox-border': dateFilters[item.key] ? '#307FE2' : '#d1d5db',
                      '--checkbox-hover-border': '#9ca3af'
                    }}
                  >
                    {dateFilters[item.key] && (
                      <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={styles.filterOptionLabel}>{item.label}</span>
              </label>
            ))}
          </div>
          
          {selectedDatePaymentRange ? (
            <div className={styles.dateRangeDisplay}>
              <div className={styles.dateRangeDisplayInner}>
                <svg className={styles.dateRangeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span className={styles.dateRangeText}>{formatDateRange(selectedDatePaymentRange)}</span>
                <button 
                  onClick={() => onDatePaymentRangeChange(null)}
                  className={styles.dateRangeClear}
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.datePickerButton} ref={datePickerRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isDatePaymentModalOpen) {
                    justOpenedRef.current = true
                    setIsDatePaymentModalOpen(true)
                    if (isDateStartModalOpen) {
                      closeDateStartModal()
                    }
                    setTempStartDate(null)
                    setTempEndDate(null)
                    setActiveInput(null)
                  } else {
                    closeDatePaymentModal()
                  }
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
                Указать период
              </button>

              {/* Date Picker Dropdown */}
              {isDatePaymentModalOpen && (
                <div 
                  key="date-payment-modal"
                  ref={datePickerModalRef}
                  className={cn(
                    styles.datePickerModal,
                    openUpward ? styles.openUpward : ''
                  )}
                  style={{ 
                    top: (() => {
                      if (!datePickerRef.current) return 'auto'
                      const buttonRect = datePickerRef.current.getBoundingClientRect()
                      const modalHeight = activeInput ? 400 : 200
                      if (openUpward) {
                        return (buttonRect.top - modalHeight - 8) + 'px'
                      }
                      return (buttonRect.bottom + 8) + 'px'
                    })(),
                    left: '280px',
                    '--modal-width': activeInput ? '600px' : '440px',
                    '--modal-animation': isClosing 
                      ? (openUpward ? 'fadeSlideOutUp 0.2s ease-in' : 'fadeSlideOut 0.2s ease-in')
                      : (openUpward ? 'fadeSlideInUp 0.25s ease-out' : 'fadeSlideIn 0.25s ease-out')
                  }}
                >
                  <div className={styles.datePickerModalContent}>
                    <div className={styles.datePickerModalBody}>
                      {/* Quick Ranges */}
                      <div className={styles.quickRanges}>
                        {quickDateRanges.map((range, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const dateRange = range.getValue()
                              onDatePaymentRangeChange(dateRange)
                              closeDatePaymentModal()
                            }}
                            className={styles.quickRangeButton}
                          >
                            {range.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Inputs */}
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
                                  {tempStartDate ? tempStartDate?.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Начало периода'}
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
                                  {tempEndDate ? tempEndDate?.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Конец периода'}
                        </span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className={styles.datePickerActions}>
                      <button
                        onClick={() => {
                          setTempStartDate(null)
                          setTempEndDate(null)
                          closeDatePaymentModal()
                        }}
                        className={cn(styles.datePickerActionButton, styles.cancel)}
                      >
                        Сбросить
                      </button>
                      <button
                        onClick={() => {
                          if (tempStartDate && tempEndDate) {
                            onDatePaymentRangeChange({ start: tempStartDate, end: tempEndDate })
                          }
                          closeDatePaymentModal()
                        }}
                        className={cn(styles.datePickerActionButton, styles.apply)}
                      >
                        Применить
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Параметры */}
        <div className={styles.filterSection}>
          <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
            Параметры
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Юрлица */}
            <div className={styles.parameterDropdown} ref={legalEntitiesDropdownRef}>
              <button 
                onClick={() => setOpenParameterDropdown(openParameterDropdown === 'legalentities' ? null : 'legalentities')}
                className={styles.parameterDropdownButton}
              >
                <div className={styles.parameterDropdownButtonContent}>
                  {legalEntities && Object.keys(selectedLegalEntities).filter(guid => selectedLegalEntities[guid]).length > 0 ? (
                    <div className={styles.parameterDropdownChips}>
                      {Object.keys(selectedLegalEntities)
                        .filter(guid => selectedLegalEntities[guid])
                        .slice(0, 2)
                        .map(guid => {
                          const entity = legalEntities.find(le => le.guid === guid)
                          if (!entity) return null
                          return (
                            <div key={guid} className={styles.parameterDropdownChip}>
                              <span className={styles.parameterDropdownChipLabel}>{entity.nazvanie || 'Без названия'}</span>
                              <div
                                className={styles.parameterDropdownChipRemove}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onLegalEntityToggle(guid)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onLegalEntityToggle(guid)
                                  }
                                }}
                              >
                                <svg className={styles.parameterDropdownChipRemoveIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            </div>
                          )
                        })}
                      {Object.keys(selectedLegalEntities).filter(guid => selectedLegalEntities[guid]).length > 2 && (
                        <span className={styles.parameterDropdownChipMore}>
                          +{Object.keys(selectedLegalEntities).filter(guid => selectedLegalEntities[guid]).length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>Юрлица</span>
                  )}
                </div>
                <svg className={cn(styles.parameterDropdownIcon, openParameterDropdown === 'legalentities' && styles.open)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openParameterDropdown === 'legalentities' && (
                <div 
                  className={styles.parameterDropdownMenu}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className={styles.parameterDropdownSearch}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Поиск по списку"
                        className={styles.parameterDropdownSearchInput}
                      />
                      <svg className={styles.parameterDropdownSearchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={styles.parameterDropdownSelectAll}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectAllLegalEntities()
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={styles.parameterDropdownSelectAllButton}
                    >
                      Выбрать все
                    </button>
                  </div>
                  
                  <div className={styles.parameterDropdownList}>
                    <div className={styles.parameterDropdownListInner}>
                      {legalEntities && legalEntities.length > 0 ? (
                        legalEntities.map((entity) => (
                          <label 
                            key={entity.guid} 
                            className={styles.parameterItem}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <div className={styles.checkboxWrapper}>
                              <input
                                type="checkbox"
                                checked={selectedLegalEntities[entity.guid] || false}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  onLegalEntityToggle(entity.guid)
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                }}
                                className={styles.checkboxInput}
                              />
                              <div 
                                className={cn(
                                  styles.checkbox,
                                  selectedLegalEntities[entity.guid] && styles.checkboxChecked
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onLegalEntityToggle(entity.guid)
                                }}
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                  onLegalEntityToggle(entity.guid)
                                }}
                                style={{
                                  '--checkbox-bg': selectedLegalEntities[entity.guid] ? '#307FE2' : 'white',
                                  '--checkbox-border': selectedLegalEntities[entity.guid] ? '#307FE2' : '#d1d5db',
                                  '--checkbox-hover-border': '#9ca3af'
                                }}
                              >
                                {selectedLegalEntities[entity.guid] && (
                                  <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <span className={styles.parameterItemLabel}>{entity.nazvanie || 'Без названия'}</span>
                          </label>
                        ))
                      ) : (
                        <div className={styles.parameterItemLabel} style={{ padding: '0.5rem', color: '#9ca3af' }}>
                          Нет доступных юрлиц
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Контрагенты */}
            <div className={styles.parameterDropdown} ref={counterAgentsDropdownRef}>
              <button 
                onClick={() => setOpenParameterDropdown(openParameterDropdown === 'counteragents' ? null : 'counteragents')}
                className={styles.parameterDropdownButton}
              >
                <div className={styles.parameterDropdownButtonContent}>
                  {counterAgents && Object.keys(selectedCounterAgents).filter(guid => selectedCounterAgents[guid]).length > 0 ? (
                    <div className={styles.parameterDropdownChips}>
                      {Object.keys(selectedCounterAgents)
                        .filter(guid => selectedCounterAgents[guid])
                        .slice(0, 2)
                        .map(guid => {
                          const agent = counterAgents.find(ca => ca.guid === guid)
                          if (!agent) return null
                          return (
                            <div key={guid} className={styles.parameterDropdownChip}>
                              <span className={styles.parameterDropdownChipLabel}>{agent.label}</span>
                              <div
                                className={styles.parameterDropdownChipRemove}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCounterAgentToggle(guid)
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onCounterAgentToggle(guid)
                                  }
                                }}
                              >
                                <svg className={styles.parameterDropdownChipRemoveIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </div>
                            </div>
                          )
                        })}
                      {Object.keys(selectedCounterAgents).filter(guid => selectedCounterAgents[guid]).length > 2 && (
                        <span className={styles.parameterDropdownChipMore}>
                          +{Object.keys(selectedCounterAgents).filter(guid => selectedCounterAgents[guid]).length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>Контрагенты</span>
                  )}
                </div>
                <svg className={cn(styles.parameterDropdownIcon, openParameterDropdown === 'counteragents' && styles.open)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {openParameterDropdown === 'counteragents' && (
                <div 
                  className={styles.parameterDropdownMenu}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className={styles.parameterDropdownSearch}>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Поиск по списку"
                        className={styles.parameterDropdownSearchInput}
                      />
                      <svg className={styles.parameterDropdownSearchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </div>
                  </div>
                  
                  <div className={styles.parameterDropdownSelectAll}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectAllCounterAgents()
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={styles.parameterDropdownSelectAllButton}
                    >
                      Выбрать все
                    </button>
                  </div>
                  
                  <div className={styles.parameterDropdownList}>
                    <div className={styles.parameterDropdownListInner}>
                      {counterAgents && counterAgents.length > 0 ? (
                        Object.entries(
                          counterAgents.reduce((acc, ca) => {
                            const group = ca.group || 'Без группы'
                            if (!acc[group]) acc[group] = []
                            acc[group].push(ca)
                            return acc
                          }, {})
                        ).map(([groupName, items]) => (
                          <div key={groupName} className={styles.parameterGroup}>
                            <div className={styles.parameterGroupTitle}>
                              {groupName}
                            </div>
                            {items.map((ca) => (
                              <label 
                                key={ca.guid} 
                                className={cn(styles.parameterItem, styles.nested)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <div className={styles.checkboxWrapper}>
                                  <input
                                    type="checkbox"
                                    checked={selectedCounterAgents[ca.guid] || false}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      onCounterAgentToggle(ca.guid)
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                    onMouseDown={(e) => {
                                      e.stopPropagation()
                                    }}
                                    className={styles.checkboxInput}
                                  />
                                <div 
                                  className={cn(
                                    styles.checkbox,
                                    selectedCounterAgents[ca.guid] && styles.checkboxChecked
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onCounterAgentToggle(ca.guid)
                                  }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation()
                                    onCounterAgentToggle(ca.guid)
                                  }}
                                  style={{
                                    '--checkbox-bg': selectedCounterAgents[ca.guid] ? '#307FE2' : 'white',
                                    '--checkbox-border': selectedCounterAgents[ca.guid] ? '#307FE2' : '#d1d5db',
                                    '--checkbox-hover-border': '#9ca3af'
                                  }}
                                >
                                  {selectedCounterAgents[ca.guid] && (
                                    <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                              <span className={styles.parameterItemLabel}>{ca.label}</span>
                            </label>
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className={styles.parameterItemLabel} style={{ padding: '0.5rem', color: '#9ca3af' }}>
                          Нет доступных контрагентов
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        </div>
        )}

        {/* Таб "Быстрые" */}
        {activeTab === 'quick' && (
          <div className={styles.filterContent} key="quick">
            <div className={styles.filterSection}>
              <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '2rem 1rem' }}>
                Быстрые фильтры будут доступны в следующей версии
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
    
    {/* Calendar Portal - показывается поверх всего */}
    {mounted && activeInput && isDatePaymentModalOpen && createPortal(
      <div 
        ref={calendarPortalRef}
        className={styles.calendarPortal}
        style={{
          position: 'fixed',
          top: `${calendarPosition.top}px`,
          left: `${calendarPosition.left}px`,
          zIndex: 10000
        }}
      >
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className={styles.calendarNavButton}
            >
              «
            </button>
            <span className={styles.calendarMonth}>
              {currentMonth?.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }).replace(/^./, str => str.toUpperCase())}
            </span>
            <button 
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className={styles.calendarNavButton}
            >
              »
            </button>
          </div>

          <div className={styles.calendarWeekdays}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className={styles.calendarWeekday}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.calendarDays}>
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
              const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
              const dayNum = i - startDay + 1
              const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
              const isCurrentMonth = dayNum > 0 && dayNum <= new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate()
              const isToday = date.toDateString() === new Date(2026, 0, 14).toDateString()
              const isSelected = (tempStartDate && date.toDateString() === tempStartDate.toDateString()) || 
                                   (tempEndDate && date.toDateString() === tempEndDate.toDateString())

              return (
                <button
                  key={i}
                  disabled={!isCurrentMonth}
                  onClick={() => {
                    if (isCurrentMonth) {
                      if (activeInput === 'start') {
                        setTempStartDate(date)
                        // Не закрываем календарь, оставляем открытым для выбора второй даты
                      } else if (activeInput === 'end') {
                        setTempEndDate(date)
                        // Не закрываем календарь, оставляем открытым
                      }
                    }
                  }}
                  className={cn(
                    styles.calendarDay,
                    !isCurrentMonth && styles.disabled,
                    isCurrentMonth && !isToday && !isSelected && styles.normal,
                    isToday && !isSelected && styles.today,
                    isSelected && styles.selected
                  )}
                >
                  {isCurrentMonth ? dayNum : ''}
                </button>
              )
            })}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  )
}
