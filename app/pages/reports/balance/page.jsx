'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { ReportFilterSidebar } from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar'
import { getBalanceReport } from '@/lib/api/ucode/balance'
import { legalEntitiesAPI } from '@/lib/api/ucode/legalEntities'
import styles from './balance.module.scss'
import '@/styles/report-filters.css'

export default function BalancePage() {
  // Balance page component - updated
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Calculate default date
  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
  }

  // Filter states
  const [selectedDate, setSelectedDate] = useState(getDefaultDate())
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')

  // Fetch legal entities for dropdown
  const { data: legalEntitiesResponse } = useQuery({
    queryKey: ['legal-entities'],
    queryFn: () => legalEntitiesAPI.getLegalEntitiesInvokeFunction({ page: 1, limit: 100 }),
    retry: 1,
    refetchOnMount: 'always',
    staleTime: 0,
    onError: (error) => {
      console.error('Error fetching legal entities:', error)
    }
  })

  // Fetch balance report data
  const { data: balanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['balance-report', selectedDate, selectedEntity, selectedCurrency],
    queryFn: () => getBalanceReport({
      as_of: selectedDate,
      account_ids: [],
      legal_entity_id: selectedEntity === '' ? '' : selectedEntity,
      user_currency_code: selectedCurrency,
      contr_agent_ids: []
    }),
    retry: 1,
    refetchOnMount: 'always',
    staleTime: 0,
    onError: (error) => {
      console.error('Error fetching balance report:', error)
    }
  })

  // Extract balance data from API response
  const balanceData = useMemo(() => {
    if (!balanceResponse?.data?.data) {
      return {
        assets: [],
        liabilities: [],
        equity: []
      }
    }

    // Transform API data to component format
    const apiData = balanceResponse.data.data
    
    // Helper function to transform API items to component format
    const transformItems = (items, level = 0) => {
      if (!items || !Array.isArray(items)) return []
      
      return items.map(item => {
        // Ensure value is always a number
        const value = typeof item.value === 'number' ? item.value : 0
        
        return {
          id: item.id || `item-${Math.random()}`,
          name: item.name || 'Неизвестно',
          level,
          value,
          totalValue: value,
          isSubtotal: Boolean(item.isSubtotal),
          details: item.children ? transformItems(item.children, level + 1) : []
        }
      })
    }
    
    return {
      assets: transformItems(apiData.assets || []),
      liabilities: transformItems(apiData.liabilities || []),
      equity: transformItems(apiData.equity || [])
    }
  }, [balanceResponse])

  // Currency options
  const currencyOptions = [
    { guid: 'RUB', label: 'RUB' },
    { guid: 'USD', label: 'USD' },
    { guid: 'EUR', label: 'EUR' }
  ]

  // Entity options from API
  const entityOptions = useMemo(() => {
    const baseOptions = [{ guid: '', label: 'Все счета' }]
    
    // Обрабатываем ответ от get_legal_entities
    if (legalEntitiesResponse?.data?.data?.data && Array.isArray(legalEntitiesResponse.data.data.data)) {
      const entitiesArray = legalEntitiesResponse.data.data.data
      
      const apiEntities = entitiesArray.map(entity => ({
        guid: entity.guid,
        label: entity.nazvanie || entity.polnoe_nazvanie || 'Неизвестный счет'
      }))
      return [...baseOptions, ...apiEntities]
    }
    
    // Логируем структуру ответа для отладки
    if (legalEntitiesResponse) {
      console.log('Legal entities API response structure:', legalEntitiesResponse)
    }
    
    return baseOptions
  }, [legalEntitiesResponse])

  useEffect(() => {
    if (!isInitialLoad) return

    const firstLevelIds = new Set()
    const addFirstLevel = (items) => {
      items.forEach(item => {
        if (item.details && item.details.length > 0) {
          firstLevelIds.add(item.id)
          item.details.forEach(child => {
            if (child.details && child.details.length > 0) {
              firstLevelIds.add(child.id)
            }
          })
        }
      })
    }

    addFirstLevel(balanceData.assets)
    addFirstLevel(balanceData.liabilities)
    addFirstLevel(balanceData.equity)

    setExpandedRows(firstLevelIds)
    setIsInitialLoad(false)
  }, [balanceData, isInitialLoad])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const renderRow = (item, parentExpanded = true) => {
    if (!parentExpanded) return null

    const hasChildren = item.details && item.details.length > 0
    const isExpanded = expandedRows.has(item.id)
    const indent = item.level * 24
    const isTotalRow = item.level === 0

    return (
      <React.Fragment key={item.id}>
        <tr className={`${styles.tr} ${isTotalRow ? styles.totalRow : ''}`}>
          <td className={styles.td} style={{ paddingLeft: `${indent + 16}px`, backgroundColor: '#fff' }}>
            <div
              className={`${styles.cellContent} ${hasChildren ? styles.clickable : ''}`}
              onClick={() => hasChildren && toggleRow(item.id)}
            >
              {hasChildren && (
                <button className={styles.expandButton}>
                  {isExpanded ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1.6665 7.99996C1.6665 5.0144 1.6665 3.52162 2.594 2.59412C3.52149 1.66663 5.01428 1.66663 7.99984 1.66663C10.9854 1.66663 12.4782 1.66663 13.4057 2.59412C14.3332 3.52162 14.3332 5.0144 14.3332 7.99996C14.3332 10.9855 14.3332 12.4783 13.4057 13.4058C12.4782 14.3333 10.9854 14.3333 7.99984 14.3333C5.01428 14.3333 3.52149 14.3333 2.594 13.4058C1.6665 12.4783 1.6665 10.9855 1.6665 7.99996Z" stroke="#667085" strokeLinejoin="round" />
                      <path d="M10.6668 8L5.3335 8" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1.6665 7.99996C1.6665 5.0144 1.6665 3.52162 2.594 2.59412C3.52149 1.66663 5.01428 1.66663 7.99984 1.66663C10.9854 1.66663 12.4782 1.66663 13.4057 2.59412C14.3332 3.52162 14.3332 5.0144 14.3332 7.99996C14.3332 10.9855 14.3332 12.4783 13.4057 13.4058C12.4782 14.3333 10.9854 14.3333 7.99984 14.3333C5.01428 14.3333 3.52149 14.3333 2.594 13.4058C1.6665 12.4783 1.6665 10.9855 1.6665 7.99996Z" stroke="#667085" strokeLinejoin="round" />
                      <path d="M10.6668 8L5.3335 8" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 5.33337L8 10.6667" stroke="#667085" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              )}
              <span className={isTotalRow ? styles.boldText : ''}>{item.name}</span>
            </div>
          </td>
          <td className={styles.td}>
            <span className={isTotalRow ? styles.boldNumber : ''}>
              {(item.totalValue === 0 || item.totalValue == null) ? '–' : Number(item.totalValue).toLocaleString('ru-RU')}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && item.details.map(child => renderRow(child, true))}
      </React.Fragment>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            <div className={styles.error}>
              <p>Ошибка загрузки данных: {error.message}</p>
              <button onClick={() => refetch()} className={styles.retryButton}>
                Повторить
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Filter Sidebar */}
        <ReportFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          entityOptions={entityOptions}
          selectedEntity={selectedEntity}
          onEntityChange={setSelectedEntity}
          dateRange={{ start: selectedDate, end: selectedDate }}
          onDateRangeChange={(range) => {
            if (range?.start) {
              const dateStr = range.start instanceof Date 
                ? range.start.toISOString().split('T')[0]
                : range.start
              setSelectedDate(dateStr)
            }
          }}
          singleDateMode={true}
        />

        {/* Filter Toggle Bar */}
        {!isFilterOpen && (
          <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
            <button className={styles.filterToggleBarButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Балансовый отчет</h1>
              </div>
              <div className={styles.headerRight}>
                <GroupedSelect
                  data={currencyOptions}
                  value={selectedCurrency}
                  onChange={(value) => setSelectedCurrency(value)}
                  placeholder="Валюта"
                  className={styles.currencySelect}
                />
                <button className={styles.moreButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="3" r="1" fill="currentColor" />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <circle cx="8" cy="13" r="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.balanceEquation}>
            Активы = Обязательства + Капитал
          </div>

          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.tableLoading}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных...</p>
              </div>
            ) : error ? (
              <div className={styles.tableError}>
                <p>Ошибка загрузки данных: {error.message}</p>
                <button onClick={() => refetch()} className={styles.retryButton}>
                  Повторить
                </button>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>СЧЕТ</th>
                    <th className={styles.th}>Итого</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {balanceData.assets.map(row => renderRow(row))}
                  {balanceData.liabilities.map(row => renderRow(row))}
                  {balanceData.equity.map(row => renderRow(row))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
