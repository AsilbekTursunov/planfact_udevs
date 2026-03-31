"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import PnLFilterSidebar from '@/components/reports/profit-and-loss/FilterSidebar'
import { pnlStore } from '@/components/reports/profit-and-loss/pnl.store'
import styles from './profit-and-loss.module.scss'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import { toJS } from 'mobx'
import SingleSelect from '@/components/shared/Selects/SingleSelect'
import { GlobalCurrency } from '../../../../constants/globalCurrency'

const accountingMethodOptions = [
  { guid: 'accrual', label: 'Метод начисления' },
  { guid: 'cash', label: 'Кассовый метод' }
]

const groupingOptions = [
  { guid: 'daily', label: 'День' },
  { guid: 'weekly', label: 'Неделя' },
  { guid: 'monthly', label: 'Месяц' }
]

const ProfitAndLossPage = observer(() => {
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)

  const { reportData, isLoading, isFetching } = pnlStore
  const loading = isLoading || isFetching

  const currencies = toJS(reportData)?.currencies?.map(item => ({
    value: item.code,
    label: item.code
  }))

  const legend = useMemo(() => reportData?.legend || [], [reportData])
  const rows = useMemo(() => reportData?.rows || [], [reportData])

  // Auto-expand first level on initial load
  useEffect(() => {
    if (!isInitialLoad || !reportData) return

    const firstLevelIds = new Set()
    rows.forEach(row => {
      if (row.level === 0 && row.details?.length > 0) {
        firstLevelIds.add(row.id)
      }
    })

    if (firstLevelIds.size > 0) {
      setExpandedRows(firstLevelIds)
      setIsInitialLoad(false)
    }
  }, [reportData, isInitialLoad, rows])

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const renderRow = (item, parentExpanded = true) => {
    if (!parentExpanded) return null

    const hasChildren = item.details && item.details.length > 0
    const isExpanded = expandedRows.has(item.id)
    const indent = item.level * 24

    const isPercentRow = item.type === 'percent'
    const isResultRow = item.type === 'result'
    const isTotalRow = item.type === 'total'

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
                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
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
                <span
                  className={`${item.level === 0 || isResultRow || isTotalRow ? styles.boldNumber : ''} ${styles.clickableCell || ''}`}
                  onClick={() => {
                    setSelectedColumn(item)
                    setSelectedMonth({ key: period.key, label: period.title })
                    setIsModalOpen(true)
                  }}
                >
                  {displayValue}
                </span>
              </td>
            )
          })}
          <td className={styles.td}>
            <span
              className={`${item.level === 0 || isResultRow || isTotalRow ? styles.boldNumber : ''} ${styles.clickableCell || ''}`}
              onClick={() => {
                setSelectedColumn(item)
                setSelectedMonth(null)
                setIsModalOpen(true)
              }}
            >
              {item.totalValue === 0 ? '–' : isPercentRow ? `${item.totalValue?.toFixed(1)}%` : item.totalValue?.toLocaleString('ru-RU')}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && item.details.map(child => renderRow(child, true))}
      </React.Fragment>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* P&L-specific Filter Sidebar */}
        <PnLFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className='text-xl whitespace-nowrap font-semibold'>Отчет о прибылях и убытках (P&L)</h1>
              {currencies && (
                <SingleSelect
                  data={currencies}
                  value={pnlStore.selectedCurrency || GlobalCurrency.code}
                  onChange={(value) => {
                    pnlStore.setSelectedCurrency(value)
                    pnlStore.fetchReport()
                  }}
                  isClearable={false}
                  withSearch={false}
                  className={'bg-white w-28'}
                  dropdownClassName={'w-28'}
                />
              )}
            </div>

            <div className={styles.headerRight}>
              <GroupedSelect
                data={groupingOptions}
                value={pnlStore.selectedGrouping}
                onChange={(value) => {
                  pnlStore.setSelectedGrouping(value)
                  pnlStore.fetchReport()
                }}
                placeholder="Способ построения"
                className={styles.groupingSelect}
              />
              <GroupedSelect
                data={accountingMethodOptions}
                value={pnlStore.isCalculation ? 'accrual' : 'cash'}
                onChange={(value) => {
                  pnlStore.setIsCalculation(value === 'accrual')
                  pnlStore.fetchReport()
                }}
                placeholder="Метод учета"
                className={styles.accountingMethodSelect}
                autoHeight={true}
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

          {/* Table with loading overlay */}
          <div className={styles.tableContainer} style={{ position: 'relative' }}>
            {/* White overlay spinner while refetching */}
            {loading && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20,
                  backdropFilter: 'blur(1px)'
                }}
              >
                <div className={styles.spinner} />
              </div>
            )}

            {!reportData && !loading ? (
              <div className={styles.emptyState}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: '16px', opacity: 0.3 }}>
                  <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 24H48M16 32H48M16 40H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: '16px', color: '#667085', marginBottom: '8px' }}>Выберите период для отображения отчета</p>
                <p style={{ fontSize: '14px', color: '#98A2B3' }}>Используйте фильтры слева для настройки параметров отчета</p>
              </div>
            ) : (
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr>
                    <th className={styles.th}>Статья</th>
                    {legend.map(period => (
                      <th key={period.key} className={styles.th}>{period.title}</th>
                    ))}
                    <th className={styles.th}>Итого</th>
                  </tr>
                </thead>
                <tbody className={styles.tbody}>
                  {rows?.map(row => renderRow(row))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <OperationCashFlowModal
        data={selectedColumn}
        selectedMonth={selectedMonth}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
})

export default ProfitAndLossPage
