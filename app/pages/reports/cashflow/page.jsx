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
import { cn } from '@/lib/utils'
import { formatPeriod } from '../../../../utils/helpers'
import CustomTooltip from '../../../../components/shared/Tooltip'

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
  const isExpanded = !!expandedMap[row.uniquePath]
  const isEndingBalance = row.id === 'ending-balance'
  const isTotal = row.id === 'overall-cash-flow' || row.id === 'ending-balance'
  const isBold = depth === 0 || isTotal

  const totalMonthSum = months.reduce((acc, m) => acc + (row.months?.[m] || 0), 0)

  return (
    <>
      <tr className={`border-b box-content border-neutral-200 transition-colors ${depth === 0 ? 'bg-neutral-50 font-semibold' : 'hover:bg-neutral-50'}`}>
        {/* Name cell */}

        <td
          className={cn(
            " sticky left-0 z-10 p-0! box-border transition-shadow duration-300",
            depth === 0 ? "bg-neutral-50" : "bg-white",
            "hover:bg-neutral-100 transition-colors",
          )}
          style={{ paddingLeft: `${depth * 1.5 + 1}rem` }}
        >
          <div
            className={`flex items-center w-full  border-r px-4 py-2 text-xss! gap-2 ${hasChildren ? "cursor-pointer" : "cursor-default"}`}
            onClick={hasChildren ? () => onToggle(row.uniquePath) : undefined}
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
            <td key={month} className="px-2  text-xs text-end border-r min-w-[150px] max-w-[150px]">
              <span
                className={` cursor-pointer ${isBold ? "font-semibold" : ""} ${!isEndingBalance ? ' hover:text-primary transition-colors' : ''}`}
                onClick={() => {
                  if (isEndingBalance) return
                  onCellClick(row, { key: month, label: legendItem?.title || month })
                }}
              >
                {/* <CustomTooltip> */}
                <span className='line-clamp-1 text-end w-full cursor-pointer'>{formatNumber(val)}</span>
                {/* </CustomTooltip> */}
              </span>
            </td>
          )
        })}

        {/* Total cell */}
        <td className="px-2 text-right border-l min-w-[150px] max-w-[150px]">
          <span
            className={`text-xs line-clamp-1 ${isBold ? "font-semibold" : "text-xs"} ${!isEndingBalance ? 'cursor-pointer hover:underline hover:text-primary transition-colors' : ''}`}
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
          key={child.uniquePath}
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
  const [modalConfig, setModalConfig] = useState({
    filterData: null,
    summaryData: null,
    title: '',
    isTransfer: false
  })
  const didAutoExpand = useRef(false)
  const tableContainerRef = useRef(null)

  const { reportData: cashFlowData, isLoading, isFetching } = cashFlowStore
  const loading = isLoading || isFetching

  const currencies = toJS(cashFlowData)?.currencies?.map(item => ({
    value: item.code,
    label: item.code
  }))

  useEffect(() => {
    cashFlowStore.fetchReport()

    const container = tableContainerRef.current
    if (!container) return

    const handleScroll = () => {
      setIsScrolled(container.scrollLeft > 0)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  // Extract legend (month columns)
  const legend = useMemo(() => cashFlowData?.legend || [], [cashFlowData])
  const months = useMemo(() => legend.map(l => l.key), [legend])

  // Transform rows into tree structure with section context
  const data = useMemo(() => {
    if (!cashFlowData?.rows) return []

    const transformRow = (row, depth = 0, sectionName = null, parentPath = '') => {
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

      const rowUniquePath = parentPath ? `${parentPath}-${row.id}` : String(row.id)

      const node = {
        id: row.id,
        uniquePath: rowUniquePath,
        name: row.name,
        total: row.totalValue || 0,
        months: monthData,
        level: depth,
        section: currentSection,
        subRows: []
      }

      if (row.details && Array.isArray(row.details) && row.details.length > 0) {
        node.subRows = row.details.map(detail => transformRow(detail, depth + 1, currentSection, rowUniquePath))
      }

      return node
    }

    return cashFlowData.rows.map(row => transformRow(row, 0, null, ''))
  }, [cashFlowData, months])

  // Auto-expand top-level rows on first load
  useEffect(() => {
    if (didAutoExpand.current || !Array.isArray(data) || data.length === 0) return
    const initial = {}
    data.forEach(row => {
      if (row.subRows?.length > 0) initial[row.uniquePath] = true
    })
    if (Object.keys(initial).length > 0) {
      setExpandedMap(initial)
      didAutoExpand.current = true
    }
  }, [data])

  const handleToggle = (uniquePath) => {
    setExpandedMap(prev => ({ ...prev, [uniquePath]: !prev[uniquePath] }))
  }

  const handleCellClick = (row, monthObj) => {
    console.log('row', row)
    console.log('monthObj', monthObj)
    // const filters = cashFlowStore.filters
    // let dateRange = { start: filters.periodStartDate, end: filters.periodEndDate }

    // if (monthObj?.key) {
    //   const [year, month] = monthObj.key.split('-').map(Number)
    //   const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    //   const lastDay = new Date(year, month, 0).getDate()
    //   const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    //   dateRange = { start: startDate, end: endDate }
    // }

    // const tips = (() => {
    //   if (['Операционный поток', 'Инвестиционный поток', 'Финансовый поток'].includes(row.name)) {
    //     return { tip: ['Поступление', 'Выплата'] }
    //   }
    //   if (row.section === 'Поступления') return { tip: ['Поступление'] }
    //   if (row.section === 'Выплаты') return { tip: ['Выплата'] }
    //   if (row.section === 'Списания') return { tip: ['Списание', 'Перемещение'] }
    //   if (row.section === 'Зачисления') return { tip: ['Зачисление', 'Перемещение'] }

    //   const nameMap = {
    //     "Поступления": ["Поступление"],
    //     "Выплаты": ["Выплата"],
    //     "Списания": ["Списание", "Перемещение"],
    //     "Зачисления": ["Зачисление", "Перемещение"],
    //     "Перемещения": ["Списание", "Зачисление", "Перемещение"],
    //   }
    //   return nameMap[row.name] ? { tip: nameMap[row.name] } : {}
    // })()

    // const filterData = {
    //   ...tips,
    //   paymentConfirmed: true,
    //   paymentNotConfirmed: false,
    //   paymentDateStart: dateRange.start,
    //   paymentDateEnd: dateRange.end,
    // }

    // const periodLabel = formatPeriod(dateRange.start, dateRange.end)
    // const isTransfer = row.name === 'Зачисления' || row.name === 'Списания' || row.name === 'Перемещения'

    // setModalConfig({
    //   filterData,
    //   summaryData: {
    //     periodLabel,
    //     totalAmount: monthObj ? (row.months?.[monthObj.key] || 0) : row.total
    //   },
    //   title: row.name,
    //   isTransfer
    // })
    // setIsModalOpen(true)
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

        <div className='px-4 mt-2 overflow-hidden'>
          <div ref={tableContainerRef} id="report-table-container" className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className={"bg-neutral-100 z-30 sticky top-0"}>
                <tr>
                  <th
                    className={cn(
                      "text-left  text-xs border-r border-neutral-200 font-medium sticky left-0 z-40 bg-neutral-100 transition-shadow duration-300",
                    )}
                    style={{ minWidth: 420 }}
                  >
                    <p className='px-4 w-full border-r py-2'> По статьям учета</p>
                  </th>
                  {legend.map(col => (
                    <th key={col.key} className="text-right  text-nowrap whitespace-nowrap lowercase min-w-[80px] max-w-[80px] border-l border-neutral-200 px-4 text-xs py-2 text-xss! font-medium" >
                      {col.title}
                    </th>
                  ))}
                  <th className="text-right text-nowrap whitespace-nowrap lowercase min-w-[80px] max-w-[80px] shrink-0 border-l border-neutral-200 px-4 text-xs py-2 text-xss! font-medium" >
                    Итого
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map(row => (
                  <TableRow
                    key={row.uniquePath}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filterData={modalConfig.filterData}
        summaryData={modalConfig.summaryData}
        title={modalConfig.title}
        isTransfer={modalConfig.isTransfer}
      />
    </div>
  )
})
