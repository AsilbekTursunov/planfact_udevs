"use client"

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './GroupedSelect.module.scss'

export function GroupedSelect({
  data = [],
  value,
  onChange,
  placeholder = "Выберите...",
  groupBy = null,
  labelKey = 'label',
  valueKey = 'guid',
  groupKey = 'group',
  className = "",
  disabled = false,
  loading = false,
  onCreate = null,
  createButtonText = "Создать",
  onEditGroup = null,
  onDeleteGroup = null,
  showGroupActions = false,
  // Pagination props
  onLoadMore = null,
  hasMore = false,
  isLoadingMore = false,
  onSearch = null,
  searchDebounceMs = 500,
  hasError = false,
  autoHeight = false, // New prop for auto height
  dropdownClassName = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef(null)
  const listRef = useRef(null)
  const searchTimeoutRef = useRef(null)

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

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (onSearch && search) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(() => {
        onSearch(search)
        setIsSearching(false)
      }, searchDebounceMs)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [search, onSearch, searchDebounceMs])

  // Handle scroll for infinite loading
  useEffect(() => {
    const listElement = listRef.current
    if (!listElement || !onLoadMore || !hasMore || isLoadingMore) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement
      // Load more when scrolled to 80% of the list
      if (scrollTop + clientHeight >= scrollHeight * 0.8) {
        onLoadMore()
      }
    }

    listElement.addEventListener('scroll', handleScroll)
    return () => listElement.removeEventListener('scroll', handleScroll)
  }, [onLoadMore, hasMore, isLoadingMore])

  // Filter data by search (only if no server-side search)
  const filteredData = onSearch ? data : data.filter(item =>
    item[labelKey]?.toLowerCase().includes(search.toLowerCase())
  )

  // Group data if groupBy is enabled
  const groupedData = groupBy
    ? filteredData.reduce((acc, item) => {
      const group = item[groupKey] || 'Без группы'
      if (!acc[group]) acc[group] = []
      acc[group].push(item)
      return acc
    }, {})
    : { 'all': filteredData }

  // Check if data is empty
  const isEmpty = filteredData.length === 0

  // Get selected item label
  const selectedItem = data.find(item => item[valueKey] === value)
  const selectedLabel = selectedItem ? selectedItem[labelKey] : placeholder

  const handleSelect = (item) => {
    onChange(item[valueKey], item)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className={cn(styles.container, className)} ref={dropdownRef}>
      <button
        type="button"
        id='button'
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || loading}
        className={cn(
          styles.Wrapperbutton,
          disabled || loading ? styles.disabled : styles.enabled,
          !value && styles.empty,
          hasError && styles.error,
          className
        )}
      >
        <div className={styles.buttonContent}>
          <span className={styles.buttonText}>{loading ? "Загрузка..." : selectedLabel}</span>
          <svg
            className={cn(styles.buttonIcon, isOpen && styles.open)}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className={cn(styles.dropdown, autoHeight && styles.dropdownAutoHeight, dropdownClassName)}>
          {/* Search input - always visible */}
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

          {/* Options list */}
          <div className={cn(styles.optionsList, autoHeight && styles.optionsListAutoHeight)} ref={listRef}>
            {isEmpty ? (
              <div className={styles.emptyState}>
                {isSearching ? 'Поиск...' : 'Ничего не найдено'}
              </div>
            ) : (
              <>
                {Object.entries(groupedData).map(([groupName, items]) => (
                  <div key={groupName} className={styles.group}>
                    {groupBy && (
                      <div className={styles.groupHeader}>
                        <span>{groupName}</span>
                        {showGroupActions && items.length > 0 && items[0][groupKey] === groupName && (
                          <div className={styles.groupActions}>
                            {onEditGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditGroup(items[0])
                                  setIsOpen(false)
                                }}
                                className={styles.groupActionButton}
                                title="Редактировать группу"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            )}
                            {onDeleteGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteGroup(items[0])
                                  setIsOpen(false)
                                }}
                                className={styles.groupActionButton}
                                title="Удалить группу"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {items.map((item) => (
                      <div key={item[valueKey]} className={styles.optionWrapper}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item)}
                          className={cn(
                            styles.option,
                            value === item[valueKey] ? styles.selected : ''
                          )}
                        >
                          {item[labelKey]}
                        </button>
                        {showGroupActions && !groupBy && (onEditGroup || onDeleteGroup) && (
                          <div className={styles.optionActions}>
                            {onEditGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditGroup(item)
                                  setIsOpen(false)
                                }}
                                className={styles.optionActionButton}
                                title="Редактировать"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                            )}
                            {onDeleteGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteGroup(item)
                                  setIsOpen(false)
                                }}
                                className={styles.optionActionButton}
                                title="Удалить"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                  {/* Loading more indicator */}
                  {isLoadingMore && (
                    <div className={styles.loadingMore}>
                      <div className={styles.loadingSpinner}></div>
                      <span>Загрузка...</span>
                    </div>
                  )}
                </>
            )}
          </div>

          {/* Create button */}
          {onCreate && (
            <div className={styles.createButtonContainer}>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  onCreate()
                }}
                className={styles.createButton}
              >
                <svg className={styles.createButtonIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {createButtonText}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
