"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './OperationsFiltersSidebar.module.scss'
import OperationCheckbox from '../../shared/Checkbox/operationCheckbox'
import NewDateRangeComponent from '../../directories/NewDateRangeComponent'

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
  const [activeTab, setActiveTab] = useState('general')
  const [isDateStartModalOpen, setIsDateStartModalOpen] = useState(false)
  const [currentMonthStart, setCurrentMonthStart] = useState(new Date(2026, 0))
  const [activeInputStart, setActiveInputStart] = useState(null)
  const [tempStartDateStart, setTempStartDateStart] = useState(null)
  const [tempEndDateStart, setTempEndDateStart] = useState(null)
  const [openUpwardStart, setOpenUpwardStart] = useState(false)
  const [openParameterDropdown, setOpenParameterDropdown] = useState(null)
  const dateStartPickerRef = useRef(null)
  const dateStartPickerModalRef = useRef(null)
  const legalEntitiesDropdownRef = useRef(null)
  const counterAgentsDropdownRef = useRef(null)
  const justOpenedStartRef = useRef(false)

  // Функция для определения направления открытия
  const calculateOpenDirection = useCallback((ref, modalHeight) => {
    if (!ref?.current) return false
    const buttonRect = ref.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - buttonRect.bottom
    const spaceAbove = buttonRect.top
    return spaceBelow < modalHeight || (spaceAbove > spaceBelow && spaceAbove > 100)
  }, [])

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
  }, [isDateStartModalOpen, activeInputStart, calculateOpenDirection])

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
      if (justOpenedStartRef.current) {
        justOpenedStartRef.current = false
        return
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
  }, [openParameterDropdown ?? null, isDateStartModalOpen ?? false, closeDateStartModal])

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
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

          <div className={styles.filterContentWrapper}>
            {/* Контент табов с анимацией */}
            {activeTab === 'general' && (
              <div className={styles.filterContent} key="general">
                {/* Тип операции */}
                <div className={styles.filterSection}>
                  <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.875rem' }}>
                    Тип операции
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </h3>
                  <div className={styles.filterOptions}>
                    {[
                      { key: 'podtverzhdena', label: 'Подтверждена' },
                      { key: 'nePodtverzhdena', label: 'Не подтверждена' }
                    ].map(item => (
                      <label key={item.key} className={styles.filterOption}>
                        <OperationCheckbox
                          key={item.key}
                          checked={dateFilters[item.key]}
                          onChange={() => onDateFilterChange(item.key)}
                          label={item.label}
                        />
                      </label>
                    ))}
                  </div>
                  {/* CustomDatePicker for date payment range */}
                  <NewDateRangeComponent
                    value={selectedDatePaymentRange}
                    onChange={onDatePaymentRangeChange}
                  />
                </div>

                {/* Параметры */}
                <div className={styles.filterSection}>
                  <h3 className={styles.filterSectionTitle} style={{ marginBottom: '0.75rem' }}>
                    Параметры
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 11.5V8M8 5.5H8.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
      </div>

    </>
  )
}
