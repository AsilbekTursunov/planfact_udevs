"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import SingleSelect from '@/components/shared/Selects/SingleSelect'
import CashFlowFilterSidebar from '@/components/reports/cashflow/FilterSidebar'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import { toJS } from 'mobx'
import ScreenLoader from '../../../../components/shared/ScreenLoader'

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
      <tr className={`border-b border-neutral-200 transition-colors ${depth === 0 ? 'bg-neutral-50 font-semibold' : 'hover:bg-neutral-50'}`}>
        {/* Name cell */}
        <td className="px-4  py-2" style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}>
          <div
            className={`flex items-center text-xss!  gap-2 ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={hasChildren ? () => onToggle(row.id) : undefined}
          >
            {hasChildren && (
              <button className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-900 transition-colors w-4 h-4">
                {isExpanded ? <ExpendClose /> : <ExpendOpen />}
              </button>
            )}
            <span className={isBold ? "font-semibold" : "text-sm"}>{row.name}</span>
          </div>
        </td>

        {/* Month value cells */}
        {months.map(month => {
          const val = row.months?.[month] ?? 0
          const legendItem = legend.find(l => l.key === month)
          return (
            <td key={month} className="px-4 py-2 text-xss! text-end border-l">
              <span
                className={`${isBold ? "font-semibold" : ""} ${!isEndingBalance ? 'cursor-pointer hover:underline hover:text-primary transition-colors' : ''}`}
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
        <td className="px-4 py-2 text-right border-l ">
          <span
            className={`${isBold ? "font-semibold" : "text-sm"} ${!isEndingBalance ? 'cursor-pointer hover:underline hover:text-primary transition-colors' : ''}`}
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
    <div className="fixed left-[80px] w-[calc(100%-80px)]  flex top-[60px] h-[calc(100%-60px)]">
      <CashFlowFilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(!isFilterOpen)} />

      {loading && <ScreenLoader />}

      <div className={"w-full relative bg-white overflow-auto pb-10"}>
        <div className="flex px-4 h-16 items-center sticky top-0 z-20 bg-white justify-between">
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
          <div className="flex items-center gap-3">
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
            <button className="flex items-center justify-center p-2 rounded-md hover:bg-neutral-100 text-neutral-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="3" r="1" fill="currentColor" />
                <circle cx="8" cy="8" r="1" fill="currentColor" />
                <circle cx="8" cy="13" r="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <div className='px-4 mt-2'>
          <table className="w-full">
            <thead className={"bg-neutral-100 z-10 sticky top-16"}>
              <tr>
                <th className="text-left px-4 py-2 text-xs border-r border-neutral-200 font-medium" style={{ minWidth: 320 }}>По статьям учета</th>
                {legend.map(col => (
                  <th key={col.key} className="text-right border-r border-neutral-200 px-4 py-2 text-xs font-medium" style={{ width: 110 }}>
                    {col.title}
                  </th>
                ))}
                <th className="text-right px-4 py-2 text-xs font-medium" style={{ width: 110 }}>Итого</th>
              </tr>
            </thead>
            <tbody>
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

      <OperationCashFlowModal
        data={selectedColumn}
        selectedMonth={selectedMonth}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
})
