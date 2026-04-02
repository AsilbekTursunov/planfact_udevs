"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import SingleSelect from '@/components/shared/Selects/SingleSelect'
import CashFlowFilterSidebar from '@/components/reports/cashflow/FilterSidebar'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import styles from './cashflow.module.scss'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import { toJS } from 'mobx'

const groupingOptions = [
  { value: 'monthly', label: 'По месяцам' },
  { value: 'quarterly', label: 'По кварталам' },
  { value: 'yearly', label: 'По годам' }
]

// Format number: empty string for zero, otherwise locale-formatted
const formatNumber = (value) => {
  if (value === 0 || value === null || value === undefined) return ''
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Recursive row renderer
function TableRow({ row, months, legend, depth = 0, expandedMap, onToggle, onCellClick }) {
  const hasChildren = row.subRows && row.subRows.length > 0
  const isExpanded = !!expandedMap[row.id]
  const isEndingBalance = row.id === 'ending-balance'
  const isTotal = row.id === 'overall-cash-flow' || row.id === 'ending-balance'
  const isBold = depth === 0 || isTotal

  const totalMonthSum = months.reduce((acc, m) => acc + (row.months?.[m] || 0), 0)

  return (
    <>
      <tr className={`${styles.tr} ${depth === 0 ? styles.topLevelRow : ''}`}>
        {/* Name cell */}
        <td className={styles.td} style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: hasChildren ? 'pointer' : 'default' }}
            onClick={hasChildren ? () => onToggle(row.id) : undefined}
          >
            {hasChildren && (
              <button className={styles.expandButton}>
                {isExpanded ? <ExpendClose /> : <ExpendOpen />}
              </button>
            )}
            <span className={isBold ? styles.boldText : ''}>{row.name}</span>
          </div>
        </td>

        {/* Month value cells */}
        {months.map(month => {
          const val = row.months?.[month] ?? 0
          const legendItem = legend.find(l => l.key === month)
          return (
            <td key={month} className={styles.td} style={{ textAlign: 'right', paddingRight: '1rem' }}>
              <span
                className={`${isBold ? styles.boldNumber : ''} ${!isEndingBalance ? styles.clickableCell : ''}`}
                onClick={() => {
                  if (isEndingBalance) return
                  onCellClick(row, { key: month, label: legendItem?.title || month })
                }}
              >
                {formatNumber(val)}
              </span>
            </td>
          )
        })}

        {/* Total cell */}
        <td className={styles.td} style={{ textAlign: 'right', paddingRight: '1rem' }}>
          <span
            className={`${isBold ? styles.boldNumber : ''} ${!isEndingBalance ? styles.clickableCell : ''}`}
            onClick={() => {
              if (isEndingBalance) return
              onCellClick(row, null)
            }}
          >
            {formatNumber(row.total || totalMonthSum)}
          </span>
        </td>
      </tr>

      {/* Render children if expanded */}
      {hasChildren && isExpanded && row.subRows.map(child => (
        <TableRow
          key={child.id}
          row={child}
          months={months}
          legend={legend}
          depth={depth + 1}
          expandedMap={expandedMap}
          onToggle={onToggle}
          onCellClick={onCellClick}
        />
      ))}
    </>
  )
}

export default observer(function CashFlowReportPage() {
  const [expandedMap, setExpandedMap] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const didAutoExpand = useRef(false)

  const { reportData: cashFlowData, isLoading, isFetching } = cashFlowStore
  const loading = isLoading || isFetching

  const currencies = toJS(cashFlowData)?.currencies?.map(item => ({
    value: item.code,
    label: item.code
  }))

  useEffect(() => {
    cashFlowStore.fetchReport()
  }, [])

  // Extract legend (month columns)
  const legend = useMemo(() => cashFlowData?.legend || [], [cashFlowData])
  const months = useMemo(() => legend.map(l => l.key), [legend])

  // Transform rows into tree structure with section context
  const data = useMemo(() => {
    if (!cashFlowData?.rows) return []

    const transformRow = (row, depth = 0, sectionName = null) => {
      const monthData = {}
      months.forEach(monthKey => {
        monthData[monthKey] = row.values?.[monthKey] || 0
      })

      let currentSection = sectionName
      if (depth === 1) {
        if (row.name === 'Поступления') currentSection = 'Поступления'
        if (row.name === 'Выплаты') currentSection = 'Выплаты'
        if (row.name === 'Списания') currentSection = 'Списания'
        if (row.name === 'Зачисления') currentSection = 'Зачисления'
      }

      const node = {
        id: row.id,
        name: row.name,
        total: row.totalValue || 0,
        months: monthData,
        level: depth,
        section: currentSection,
        subRows: []
      }

      if (row.details && Array.isArray(row.details) && row.details.length > 0) {
        node.subRows = row.details.map(detail => transformRow(detail, depth + 1, currentSection))
      }

      return node
    }

    return cashFlowData.rows.map(row => transformRow(row, 0))
  }, [cashFlowData, months])

  // Auto-expand top-level rows on first load
  useEffect(() => {
    if (didAutoExpand.current || !Array.isArray(data) || data.length === 0) return
    const initial = {}
    data.forEach(row => {
      if (row.subRows?.length > 0) initial[row.id] = true
    })
    if (Object.keys(initial).length > 0) {
      setExpandedMap(initial)
      didAutoExpand.current = true
    }
  }, [data])

  const handleToggle = (id) => {
    setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCellClick = (row, monthObj) => {
    setSelectedColumn(row)
    setSelectedMonth(monthObj)
    setIsModalOpen(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <CashFlowFilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />

        {!isFilterOpen && (
          <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
            <button className={styles.filterToggleBarButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10H16M16 10L11 5M16 10L11 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        <div className={`${styles.mainContent} ${isFilterOpen ? styles.mainContentWithFilter : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className='text-xl whitespace-nowrap font-semibold'>Отчет о движении денежных средств</h1>
              <SingleSelect
                data={currencies}
                value={cashFlowStore.filters.currencyCode}
                onChange={(value) => {
                  cashFlowStore.setCurrencyCode(value)
                  cashFlowStore.fetchReport()
                }}
                isClearable={false}
                withSearch={false}
                className={'bg-white w-28'}
                dropdownClassName={'w-28'}
              />
            </div>
            <div className={styles.headerRight}>
              <SingleSelect
                data={groupingOptions}
                value={cashFlowStore.filters.periodType}
                onChange={(value) => {
                  cashFlowStore.setPeriodType(value)
                  cashFlowStore.fetchReport()
                }}
                placeholder="Способ построения"
                withSearch={false}
                isClearable={false}
                className="bg-white w-44"
                dropdownClassName="bg-white"
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

          <div
            className={`${styles.tableContainer} ${isFilterOpen ? styles.tableContainerWithFilter : ''}`}
            style={{ position: 'relative' }}
          >
            {loading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner} />
                <span>Загрузка данных...</span>
              </div>
            )}

            <table className={`${styles.table}`}>
              <thead className={"bg-neutral-100 z-10 sticky top-0"}>
                <tr>
                  <th className={styles.th} style={{ minWidth: 320 }}>По статьям учета</th>
                  {legend.map(col => (
                    <th key={col.key} className={styles.th} style={{ width: 110, textAlign: 'right', paddingRight: '1rem' }}>
                      {col.title}
                    </th>
                  ))}
                  <th className={styles.th} style={{ width: 110, textAlign: 'right', paddingRight: '1rem' }}>Итого</th>
                </tr>
              </thead>
              <tbody className={styles.tbody}>
                {data.map(row => (
                  <TableRow
                    key={row.id}
                    row={row}
                    months={months}
                    legend={legend}
                    depth={0}
                    expandedMap={expandedMap}
                    onToggle={handleToggle}
                    onCellClick={handleCellClick}
                  />
                ))}
              </tbody>
            </table>
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
