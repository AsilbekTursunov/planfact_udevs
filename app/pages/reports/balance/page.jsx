'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { ReportFilterSidebar } from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar'
import styles from './balance.module.scss'
import '@/styles/report-filters.css'

export default function BalancePage() {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Calculate default date
  const getDefaultDate = () => {
    return new Date()
  }

  // Filter states
  const [selectedDate, setSelectedDate] = useState(getDefaultDate())
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [selectedCurrency, setSelectedCurrency] = useState('RUB')

  // Mock data for selects
  const currencyOptions = [
    { guid: 'RUB', label: 'RUB' },
    { guid: 'USD', label: 'USD' },
    { guid: 'EUR', label: 'EUR' }
  ]

  const entityOptions = [
    { guid: 'all', label: 'Все организации' },
    { guid: 'entity1', label: 'ООО "Компания 1"' },
    { guid: 'entity2', label: 'ООО "Компания 2"' }
  ]

  // Mock legend (months)
  const legend = useMemo(() => [
    { key: '2025-09', title: 'Сен 2025' },
    { key: '2025-10', title: 'Окт 2025' },
    { key: '2025-11', title: 'Ноя 2025' },
    { key: '2025-12', title: 'Дек 2025' },
    { key: '2026-01', title: 'Янв 2026' },
    { key: '2026-02', title: 'Фев 2026' }
  ], [])

  // Mock balance data with values per month
  const balanceData = useMemo(() => ({
    assets: [
      {
        id: 'assets',
        name: 'Активы',
        level: 0,
        values: { '2025-09': 15000, '2025-10': 15500, '2025-11': 16000, '2025-12': 16100, '2026-01': 16200, '2026-02': 16266 },
        totalValue: 16266,
        details: [
          {
            id: 'current-assets',
            name: 'Оборотные активы',
            level: 1,
            values: { '2025-09': 15100, '2025-10': 15600, '2025-11': 16100, '2025-12': 16200, '2026-01': 16300, '2026-02': 16377 },
            totalValue: 16377,
            details: [
              { 
                id: 'cash', 
                name: 'Денежные средства', 
                level: 2, 
                values: { '2025-09': 14800, '2025-10': 15300, '2025-11': 15800, '2025-12': 15900, '2026-01': 16000, '2026-02': 16037 },
                totalValue: 16037 
              },
              { 
                id: 'receivables', 
                name: 'Дебиторская задолженность', 
                level: 2, 
                values: { '2025-09': 300, '2025-10': 300, '2025-11': 300, '2025-12': 300, '2026-01': 300, '2026-02': 340 },
                totalValue: 340 
              }
            ]
          },
          {
            id: 'fixed-assets',
            name: 'Внеоборотные активы',
            level: 1,
            values: { '2025-09': -100, '2025-10': -100, '2025-11': -100, '2025-12': -100, '2026-01': -100, '2026-02': -111 },
            totalValue: -111,
            details: [
              { 
                id: 'equipment', 
                name: 'Основные средства', 
                level: 2, 
                values: { '2025-09': -100, '2025-10': -100, '2025-11': -100, '2025-12': -100, '2026-01': -100, '2026-02': -111 },
                totalValue: -111 
              }
            ]
          }
        ]
      }
    ],
    liabilities: [
      {
        id: 'liabilities',
        name: 'Обязательства',
        level: 0,
        values: { '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0, '2026-01': 0, '2026-02': 0 },
        totalValue: 0,
        details: [
          {
            id: 'current-liabilities',
            name: 'Краткосрочные обязательства',
            level: 1,
            values: { '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0, '2026-01': 0, '2026-02': 0 },
            totalValue: 0,
            details: [
              { 
                id: 'payables', 
                name: 'Кредиторская задолженность', 
                level: 2, 
                values: { '2025-09': 0, '2025-10': 0, '2025-11': 0, '2025-12': 0, '2026-01': 0, '2026-02': 0 },
                totalValue: 0 
              }
            ]
          }
        ]
      }
    ],
    equity: [
      {
        id: 'equity',
        name: 'Капитал',
        level: 0,
        values: { '2025-09': 15000, '2025-10': 15500, '2025-11': 16000, '2025-12': 16100, '2026-01': 16200, '2026-02': 16266 },
        totalValue: 16266,
        details: [
          { 
            id: 'retained-earnings', 
            name: 'Нераспределенная прибыль', 
            level: 1, 
            values: { '2025-09': 15000, '2025-10': 15500, '2025-11': 16000, '2025-12': 16100, '2026-01': 16200, '2026-02': 16266 },
            totalValue: 16266 
          }
        ]
      }
    ]
  }), [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // Auto-expand first level on initial load
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
          {legend.map(period => {
            const value = item.values?.[period.key] || 0
            const displayValue = value === 0 ? '–' : value.toLocaleString('ru-RU')

            return (
              <td key={period.key} className={styles.td}>
                <span className={isTotalRow ? styles.boldNumber : ''}>
                  {displayValue}
                </span>
              </td>
            )
          })}
          <td className={styles.td}>
            <span className={isTotalRow ? styles.boldNumber : ''}>
              {item.totalValue === 0 ? '–' : item.totalValue.toLocaleString('ru-RU')}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && item.details.map(child => renderRow(child, true))}
      </React.Fragment>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.mainContent}>
            <div className={styles.loading}>Загрузка данных...</div>
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
          accountOptions={[]}
          selectedAccounts={selectedAccounts}
          onAccountsChange={setSelectedAccounts}
          dateRange={{ start: selectedDate, end: selectedDate }}
          onDateRangeChange={(range) => setSelectedDate(range.start)}
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
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>СЧЕТ</th>
                  {legend.map(period => (
                    <th key={period.key} className={styles.th}>
                      {period.title}
                    </th>
                  ))}
                  <th className={styles.th}>Итого</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {balanceData.assets.map(row => renderRow(row))}
                {balanceData.liabilities.map(row => renderRow(row))}
                {balanceData.equity.map(row => renderRow(row))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
