"use client"

import React, { useState, useEffect } from 'react'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { DateRangePicker } from '@/components/directories/DateRangePicker/DateRangePicker'
import { getProfitAndLoss } from '@/lib/api/ucode/profitAndLoss'
import styles from './profit-and-loss.module.scss'

export default function ProfitAndLossPage() {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [selectedGrouping, setSelectedGrouping] = useState('monthly')

  // Mock data for selects
  const groupingOptions = [
    { guid: 'monthly', label: 'По месяцам' },
    { guid: 'quarterly', label: 'По кварталам' },
    { guid: 'yearly', label: 'По годам' }
  ]
  
  const periodOptions = [
    { guid: 'all', label: 'Весь период' },
    { guid: 'q1', label: '1 квартал 2026' },
    { guid: 'q2', label: '2 квартал 2026' },
    { guid: 'h1', label: 'Полугодие 2026' },
    { guid: 'year', label: 'Год 2026' }
  ]

  const entityOptions = [
    { guid: 'all', label: 'Все организации' },
    { guid: 'entity1', label: 'ООО "Компания 1"' },
    { guid: 'entity2', label: 'ООО "Компания 2"' },
    { guid: 'entity3', label: 'ИП Иванов И.И.' }
  ]

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await getProfitAndLoss({
          periodStartDate: '2025-01-01',
          periodEndDate: '2026-12-31',
          periodType: selectedGrouping,
          currencyCode: 'RUB'
        })
        
        console.log('P&L API Response:', response)
        
        if (response?.data?.data?.data) {
          console.log('Setting P&L report data:', response.data.data.data)
          setReportData(response.data.data.data)
        } else {
          console.error('Data not found in expected path')
        }
      } catch (error) {
        console.error('Error fetching P&L report:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedGrouping])

  // Auto-expand first level items on initial load
  useEffect(() => {
    if (!isInitialLoad || !reportData) return
    
    const revenue = reportData?.revenue || []
    const expenses = reportData?.expenses || []
    const allItems = [...revenue, ...expenses]
    
    const firstLevelIds = new Set()
    allItems.forEach(item => {
      if (item.level === 0 && item.details && item.details.length > 0) {
        firstLevelIds.add(item.id)
      }
    })
    
    if (firstLevelIds.size > 0) {
      setExpandedRows(firstLevelIds)
      setIsInitialLoad(false)
    }
  }, [reportData, isInitialLoad])

  const legend = reportData?.legend || []
  const revenue = reportData?.revenue || []
  const expenses = reportData?.expenses || []
  const grossProfit = reportData?.grossProfit || 0
  const netProfit = reportData?.netProfit || 0

  // Toggle row expansion
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

  // Render row recursively
  const renderRow = (item, parentExpanded = true) => {
    if (!parentExpanded) return null
    
    const hasChildren = item.details && item.details.length > 0
    const isExpanded = expandedRows.has(item.id)
    const indent = item.level * 24

    return (
      <React.Fragment key={item.id}>
        <tr className={styles.tr}>
          <td className={styles.td} style={{ paddingLeft: `${indent + 16}px` }}>
            <div 
              className={`${styles.cellContent} ${hasChildren ? styles.clickable : ''}`}
              onClick={() => hasChildren && toggleRow(item.id)}
            >
              {hasChildren && (
                <button
                  className={styles.expandButton}
                >
                  {isExpanded ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.6665 7.99996C1.6665 5.0144 1.6665 3.52162 2.594 2.59412C3.52149 1.66663 5.01428 1.66663 7.99984 1.66663C10.9854 1.66663 12.4782 1.66663 13.4057 2.59412C14.3332 3.52162 14.3332 5.0144 14.3332 7.99996C14.3332 10.9855 14.3332 12.4783 13.4057 13.4058C12.4782 14.3333 10.9854 14.3333 7.99984 14.3333C5.01428 14.3333 3.52149 14.3333 2.594 13.4058C1.6665 12.4783 1.6665 10.9855 1.6665 7.99996Z" stroke="#667085" strokeLinejoin="round"/>
                      <path d="M10.6668 8L5.3335 8" stroke="#667085" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.6665 7.99996C1.6665 5.0144 1.6665 3.52162 2.594 2.59412C3.52149 1.66663 5.01428 1.66663 7.99984 1.66663C10.9854 1.66663 12.4782 1.66663 13.4057 2.59412C14.3332 3.52162 14.3332 5.0144 14.3332 7.99996C14.3332 10.9855 14.3332 12.4783 13.4057 13.4058C12.4782 14.3333 10.9854 14.3333 7.99984 14.3333C5.01428 14.3333 3.52149 14.3333 2.594 13.4058C1.6665 12.4783 1.6665 10.9855 1.6665 7.99996Z" stroke="#667085" strokeLinejoin="round"/>
                      <path d="M10.6668 8L5.3335 8" stroke="#667085" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 5.33337L8 10.6667" stroke="#667085" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              )}
              <span className={item.level === 0 ? styles.boldText : ''}>{item.name}</span>
            </div>
          </td>
          {legend.map(period => (
            <td key={period.key} className={styles.td}>
              <span className={item.level === 0 ? styles.boldNumber : ''}>
                {item.values?.[period.key] || 0}
              </span>
            </td>
          ))}
          <td className={styles.td}>
            <span className={item.level === 0 ? styles.boldNumber : ''}>
              {item.totalValue || 0}
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
        <div className={styles.loading}>Загрузка данных...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Filter Sidebar */}
        <div className={`${styles.filterSidebar} ${isFilterOpen ? styles.filterSidebarOpen : ''}`}>
          <div className={styles.filterSidebarContent}>
            <div className={styles.filterSidebarHeader}>
              <h2 className={styles.filterSidebarTitle}>Фильтры</h2>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className={styles.filterSidebarClose}
              >
                ✕
              </button>
            </div>

            {/* Период */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>Период</h3>
              <GroupedSelect
                data={periodOptions}
                value={selectedPeriod}
                onChange={(value) => setSelectedPeriod(value)}
                placeholder="Выберите период"
              />
            </div>

            {/* Юридическое лицо */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>Юридическое лицо</h3>
              <GroupedSelect
                data={entityOptions}
                value={selectedEntity}
                onChange={(value) => setSelectedEntity(value)}
                placeholder="Выберите организацию"
              />
            </div>

            {/* Диапазон дат */}
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>Диапазон дат</h3>
              <DateRangePicker
                selectedRange={dateRange}
                onChange={setDateRange}
                placeholder="Выберите период"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Отчет о прибылях и убытках (P&L)</h1>
                <button className={styles.infoButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
                    <path d="M8 7V11" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="8" cy="5" r="0.5" fill="#9CA3AF"/>
                  </svg>
                </button>
                <span className={styles.currency}>RUB</span>
              </div>
              <div className={styles.headerRight}>
                <GroupedSelect
                  data={groupingOptions}
                  value={selectedGrouping}
                  onChange={(value) => setSelectedGrouping(value)}
                  placeholder="Способ построения"
                  className={styles.groupingSelect}
                />
                <button
                  className={`${styles.filterToggleButton} ${isFilterOpen ? styles.filterToggleButtonActive : ''}`}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Отображение</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className={styles.moreButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1" fill="currentColor"/>
                    <circle cx="8" cy="8" r="1" fill="currentColor"/>
                    <circle cx="8" cy="13" r="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className={`${styles.tableContainer} ${isFilterOpen ? styles.tableContainerWithFilter : ''}`}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Статья</th>
                  {legend.map(period => (
                    <th key={period.key} className={styles.th}>
                      {period.title}
                    </th>
                  ))}
                  <th className={styles.th}>Итого</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {/* Revenue Section */}
                {revenue.map(item => renderRow(item))}

                {/* Expenses Section */}
                {expenses.map(item => renderRow(item))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
