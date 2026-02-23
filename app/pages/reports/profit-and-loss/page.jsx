"use client"

import React, { useState, useEffect } from 'react'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { ReportFilterSidebar } from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar'
import { getProfitAndLoss } from '@/lib/api/ucode/profitAndLoss'
import { bankAccountsAPI } from '@/lib/api/ucode/bankAccounts'
import { counterpartiesAPI } from '@/lib/api/ucode/counterparties'
import styles from './profit-and-loss.module.scss'
import '@/styles/report-filters.css'

export default function ProfitAndLossPage() {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  // Data from API
  const [accounts, setAccounts] = useState([])
  const [counterparties, setCounterparties] = useState([])
  
  // Calculate default date range (last 6 months)
  const getDefaultDateRange = () => {
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 6)
    
    return {
      start: start,
      end: end
    }
  }
  
  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [selectedAccounts, setSelectedAccounts] = useState([]) // Multiple selection
  const [selectedCounterparties, setSelectedCounterparties] = useState([]) // Multiple selection
  const [dateRange, setDateRange] = useState(getDefaultDateRange()) // Default to last 6 months
  const [selectedGrouping, setSelectedGrouping] = useState('monthly')
  
  // Accounting method: true = Accrual (начисление), false = Cash (кассовый)
  const [isCalculation, setIsCalculation] = useState(true)
  
  // Profit types filter - default to all disabled, load from localStorage after mount
  const [profitTypes, setProfitTypes] = useState({
    operational: false,  // isOperatingProfit
    ebitda: false,       // isEbitda
    ebit: false,         // isEbit
    ebt: false           // isEbt
  })
  
  // Load profit types from localStorage after component mounts (client-side only)
  useEffect(() => {
    const saved = localStorage.getItem('profitAndLoss_profitTypes')
    if (saved) {
      try {
        setProfitTypes(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing saved profit types:', e)
      }
    }
  }, [])
  
  // Save profit types to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('profitAndLoss_profitTypes', JSON.stringify(profitTypes))
  }, [profitTypes])
  
  const toggleProfitType = (type) => {
    setProfitTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }))
  }

  // Mock data for selects
  const accountingMethodOptions = [
    { guid: 'accrual', label: 'Метод начисления' },
    { guid: 'cash', label: 'Кассовый метод' }
  ]
  
  const groupingOptions = [
    { guid: 'daily', label: 'День' },
    { guid: 'weekly', label: 'Неделя' },
    { guid: 'monthly', label: 'Месяц' }
  ]
  
  const periodOptions = [
    { guid: 'all', label: 'Весь период' },
    { guid: 'day', label: 'День' },
    { guid: 'week', label: 'Неделя' },
    { guid: 'month', label: 'Месяц' }
  ]

  const entityOptions = [
    { guid: 'all', label: 'Все организации' },
    { guid: 'entity1', label: 'ООО "Компания 1"' },
    { guid: 'entity2', label: 'ООО "Компания 2"' },
    { guid: 'entity3', label: 'ИП Иванов И.И.' }
  ]

  // Fetch accounts and counterparties on mount
  useEffect(() => {
    const fetchFiltersData = async () => {
      console.log('🔵 Starting to fetch filters data...')
      try {
        // Fetch bank accounts (not chart of accounts)
        console.log('� Fetching bank accounts...')
        const accountsResponse = await bankAccountsAPI.getBankAccountsInvokeFunction({ limit: 1000 })
        console.log('� Full bank accounts response:', JSON.stringify(accountsResponse, null, 2))
        
        // Try different possible data paths
        let accountsData = null
        if (accountsResponse?.data?.data?.data) {
          accountsData = accountsResponse.data.data.data
          console.log('� Found bank accounts at data.data.data')
        } else if (accountsResponse?.data?.data) {
          accountsData = accountsResponse.data.data
          console.log('� Found bank accounts at data.data')
        } else if (accountsResponse?.data) {
          accountsData = accountsResponse.data
          console.log('� Found bank accounts at data')
        }
        
        if (accountsData && Array.isArray(accountsData)) {
          const accountsList = accountsData.map(acc => ({
            guid: acc.guid,
            label: acc.nazvanie || acc.name || acc.nomer_scheta || 'Unnamed'
          }))
          console.log('✅ Bank accounts list:', accountsList)
          setAccounts(accountsList)
        } else {
          console.log('⚠️ No bank accounts data found or not an array:', accountsData)
        }

        // Fetch counterparties
        console.log('👥 Fetching counterparties...')
        const counterpartiesResponse = await counterpartiesAPI.getCounterpartiesInvokeFunction({ limit: 1000 })
        console.log('👥 Full counterparties response:', JSON.stringify(counterpartiesResponse, null, 2))
        
        // Try different possible data paths
        let counterpartiesData = null
        if (counterpartiesResponse?.data?.data?.data) {
          counterpartiesData = counterpartiesResponse.data.data.data
          console.log('👥 Found counterparties at data.data.data')
        } else if (counterpartiesResponse?.data?.data) {
          counterpartiesData = counterpartiesResponse.data.data
          console.log('👥 Found counterparties at data.data')
        } else if (counterpartiesResponse?.data) {
          counterpartiesData = counterpartiesResponse.data
          console.log('👥 Found counterparties at data')
        }
        
        if (counterpartiesData && Array.isArray(counterpartiesData)) {
          const counterpartiesList = counterpartiesData.map(cp => ({
            guid: cp.guid,
            label: cp.nazvanie || cp.polnoe_imya || cp.name || 'Unnamed'
          }))
          console.log('✅ Counterparties list:', counterpartiesList)
          setCounterparties(counterpartiesList)
        } else {
          console.log('⚠️ No counterparties data found or not an array:', counterpartiesData)
        }
      } catch (error) {
        console.error('❌ Error fetching filters data:', error)
        console.error('❌ Error details:', error.message)
        console.error('❌ Error stack:', error.stack)
      }
    }

    fetchFiltersData()
  }, [])

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      // If no date range selected, don't fetch
      if (!dateRange || !dateRange.start || !dateRange.end) {
        setLoading(false)
        setReportData(null)
        return
      }
      
      try {
        setLoading(true)
        
        // Format dates for API (expects YYYY-MM-DD strings)
        const formatDate = (date, isEndDate = false) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        // For end date, we need to include the whole day
        // So we add 1 day to make it inclusive
        const endDateAdjusted = new Date(dateRange.end)
        endDateAdjusted.setDate(endDateAdjusted.getDate() + 1)
        
        const startDate = formatDate(dateRange.start)
        const endDate = formatDate(endDateAdjusted)
        
        console.log('📅 Date Range being sent to API:', {
          startDate,
          endDate,
          originalEndDate: formatDate(dateRange.end),
          dateRangeObject: dateRange
        })
        
        // Map selectedPeriod to periodType for API
        const getPeriodType = () => {
          switch (selectedPeriod) {
            case 'day':
              return 'daily'
            case 'week':
              return 'weekly'
            case 'month':
              return 'monthly'
            case 'all':
            default:
              return selectedGrouping // Use grouping from header if "all" selected
          }
        }
        
        const apiParams = {
          periodStartDate: startDate,
          periodEndDate: endDate,
          periodType: getPeriodType(),
          currencyCode: 'RUB',
          isCalculation: isCalculation,
          isGrossProfit: false,
          isOperatingProfit: profitTypes.operational,
          isEbitda: profitTypes.ebitda,
          isEbit: profitTypes.ebit,
          isEbt: profitTypes.ebt,
          reportGenMethod: 0,
          includeTrendData: true,
          aggregationMode: 'autoAggregate',
        }
        
        // Only add filter arrays if they have values
        if (selectedAccounts.length > 0) {
          apiParams.accountId = selectedAccounts
        }
        if (selectedCounterparties.length > 0) {
          apiParams.contrAgentId = selectedCounterparties
        }
        
        
        const response = await getProfitAndLoss(apiParams)
        
        if (response?.data?.data?.data) {
          const apiData = response.data.data.data
          
          // Combine revenue and rows into a single array
          // Revenue comes first, then expenses and other rows
          const combinedRows = [
            ...(apiData.revenue || []),
            ...(apiData.rows || [])
          ]
          
          // Update reportData with combined rows
          setReportData({
            ...apiData,
            rows: combinedRows
          })
          
          console.log('📊 Combined rows:', combinedRows)
        } else {
          console.error('Data not found in expected path')
        }
      } catch (error) {
        console.error('Error fetching P&L report:', error)
        console.error('Error response:', error.response?.data)
        console.error('Error status:', error.response?.status)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedGrouping, isCalculation, profitTypes, dateRange, selectedPeriod, selectedAccounts, selectedCounterparties])

  // Auto-expand first level items on initial load
  useEffect(() => {
    if (!isInitialLoad || !reportData) return
    
    const rows = reportData?.rows || []
    
    const firstLevelIds = new Set()
    rows.forEach(row => {
      if (row.level === 0 && row.details && row.details.length > 0) {
        firstLevelIds.add(row.id)
      }
    })
    
    if (firstLevelIds.size > 0) {
      setExpandedRows(firstLevelIds)
      setIsInitialLoad(false)
    }
  }, [reportData, isInitialLoad])

  const legend = reportData?.legend || []
  const rows = reportData?.rows || []

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

    // Determine row styling based on type
    const isPercentRow = item.type === 'percent'
    const isResultRow = item.type === 'result'
    const isTotalRow = item.type === 'total'

    return (
      <React.Fragment key={item.id}>
        <tr className={`${styles.tr} ${isTotalRow ? styles.totalRow : ''}`}>
          <td className={styles.td} style={{ paddingLeft: `${indent + 16}px` }}>
            <div 
              className={`${styles.cellContent} ${hasChildren ? styles.clickable : ''}`}
              onClick={() => hasChildren && toggleRow(item.id)}
            >
              {hasChildren && (
                <button className={styles.expandButton}>
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
              <span className={item.level === 0 || isResultRow || isTotalRow ? styles.boldText : ''}>
                {item.name}
              </span>
            </div>
          </td>
          {legend.map(period => {
            const value = item.values?.[period.key] || 0
            const displayValue = value === 0 ? '–' : isPercentRow ? `${value.toFixed(1)}%` : value.toLocaleString('ru-RU')
            
            return (
              <td key={period.key} className={styles.td}>
                <span className={item.level === 0 || isResultRow || isTotalRow ? styles.boldNumber : ''}>
                  {displayValue}
                </span>
              </td>
            )
          })}
          <td className={styles.td}>
            <span className={item.level === 0 || isResultRow || isTotalRow ? styles.boldNumber : ''}>
              {item.totalValue === 0 ? '–' : isPercentRow ? `${item.totalValue.toFixed(1)}%` : item.totalValue.toLocaleString('ru-RU')}
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
          {/* Filter Sidebar */}
          <ReportFilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            entityOptions={entityOptions}
            selectedEntity={selectedEntity}
            onEntityChange={setSelectedEntity}
            accountOptions={accounts}
            selectedAccounts={selectedAccounts}
            onAccountsChange={setSelectedAccounts}
            counterpartyOptions={counterparties}
            selectedCounterparties={selectedCounterparties}
            onCounterpartiesChange={setSelectedCounterparties}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            profitTypes={profitTypes}
            onProfitTypesChange={toggleProfitType}
          />

          {/* Filter Toggle Bar */}
          {!isFilterOpen && (
            <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
              <button className={styles.filterToggleBarButton}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Main Content with Loading */}
          <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div className={styles.titleRow}>
                  <h1 className={styles.title}>Отчет о прибылях и убытках (P&L)</h1> 
                </div>
                <div className={styles.headerRight}>
                  <GroupedSelect
                    data={groupingOptions}
                    value={selectedGrouping}
                    onChange={(value) => setSelectedGrouping(value)}
                    placeholder="Способ построения"
                    className={styles.groupingSelect}
                  />
                  <GroupedSelect
                    data={accountingMethodOptions}
                    value={isCalculation ? 'accrual' : 'cash'}
                    onChange={(value) => setIsCalculation(value === 'accrual')}
                    placeholder="Метод учета"
                    className={styles.accountingMethodSelect}
                    autoHeight={true}
                  />
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
            
            <div className={styles.loading}>Загрузка данных...</div>
          </div>
        </div>
      </div>
    )
  }

  // Empty state when no date range selected
  if (!dateRange || !reportData) {
    return (
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Filter Sidebar */}
          <ReportFilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            periodOptions={periodOptions}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            entityOptions={entityOptions}
            selectedEntity={selectedEntity}
            onEntityChange={setSelectedEntity}
            accountOptions={accounts}
            selectedAccounts={selectedAccounts}
            onAccountsChange={setSelectedAccounts}
            counterpartyOptions={counterparties}
            selectedCounterparties={selectedCounterparties}
            onCounterpartiesChange={setSelectedCounterparties}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            profitTypes={profitTypes}
            onProfitTypesChange={toggleProfitType}
          />

          {/* Filter Toggle Bar */}
          {!isFilterOpen && (
            <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
              <button className={styles.filterToggleBarButton}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Main Content - Empty State */}
          <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
            <div className={styles.header}>
              <div className={styles.headerContent}>
                <div className={styles.titleRow}>
                  <h1 className={styles.title}>Отчет о прибылях и убытках (P&L)</h1> 
                </div>
                <div className={styles.headerRight}>
                  <GroupedSelect
                    data={groupingOptions}
                    value={selectedGrouping}
                    onChange={(value) => setSelectedGrouping(value)}
                    placeholder="Способ построения"
                    className={styles.groupingSelect}
                  />
                  <GroupedSelect
                    data={accountingMethodOptions}
                    value={isCalculation ? 'accrual' : 'cash'}
                    onChange={(value) => setIsCalculation(value === 'accrual')}
                    placeholder="Метод учета"
                    className={styles.accountingMethodSelect}
                    autoHeight={true}
                  />
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
            
            <div className={styles.emptyState}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px', opacity: 0.3 }}>
                <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 24H48M16 32H48M16 40H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ fontSize: '16px', color: '#667085', marginBottom: '8px' }}>Выберите период для отображения отчета</p>
              <p style={{ fontSize: '14px', color: '#98A2B3' }}>Используйте фильтры слева для настройки параметров отчета</p>
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
          periodOptions={periodOptions}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          entityOptions={entityOptions}
          selectedEntity={selectedEntity}
          onEntityChange={setSelectedEntity}
          accountOptions={accounts}
          selectedAccounts={selectedAccounts}
          onAccountsChange={setSelectedAccounts}
          counterpartyOptions={counterparties}
          selectedCounterparties={selectedCounterparties}
          onCounterpartiesChange={setSelectedCounterparties}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          profitTypes={profitTypes}
          onProfitTypesChange={toggleProfitType}
        />

        {/* Filter Toggle Bar */}
        {!isFilterOpen && (
          <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
            <button className={styles.filterToggleBarButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>Отчет о прибылях и убытках (P&L)</h1> 
              </div>
              <div className={styles.headerRight}>
                <GroupedSelect
                  data={groupingOptions}
                  value={selectedGrouping}
                  onChange={(value) => setSelectedGrouping(value)}
                  placeholder="Способ построения"
                  className={styles.groupingSelect}
                />
                <GroupedSelect
                  data={accountingMethodOptions}
                  value={isCalculation ? 'accrual' : 'cash'}
                  onChange={(value) => setIsCalculation(value === 'accrual')}
                  placeholder="Метод учета"
                  className={styles.accountingMethodSelect}
                  autoHeight={true}
                />
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
          
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr >
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
                {/* Render all rows from API */}
                {rows?.map(row => renderRow(row))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
