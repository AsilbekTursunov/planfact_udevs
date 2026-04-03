"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import PnLFilterSidebar from '@/components/reports/profit-and-loss/FilterSidebar'
import { pnlStore } from '@/components/reports/profit-and-loss/pnl.store'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import { toJS } from 'mobx'
import SingleSelect from '@/components/shared/Selects/SingleSelect'
import { GlobalCurrency } from '../../../../constants/globalCurrency'
import ScreenLoader from '../../../../components/shared/ScreenLoader'

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
        <tr className={`border-b border-neutral-200 transition-colors ${item.level === 0 || isResultRow || isTotalRow ? 'bg-neutral-50 font-semibold' : 'hover:bg-neutral-50'}`}>
          <td className="px-4 py-2" style={{ paddingLeft: `${indent + 16}px` }}>
            <div
              className={`flex text-sm font-medium items-center gap-2 ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => hasChildren && toggleRow(item.id)}
            >
              {hasChildren && (
                <button className="bg-transparent border-none p-0 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-900 transition-colors w-4 h-4">
                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                </button>
              )}
              <span className={item.level === 0 || isResultRow || isTotalRow ? "font-semibold" : "text-sm"}>
                {item.name}
              </span>
            </div>
          </td>
          {legend.map(period => {
            const value = item.values?.[period.key] || 0
            const displayValue = value === 0 ? '' : isPercentRow ? `${value.toFixed(1)}%` : value.toLocaleString('ru-RU')
            return (
              <td key={period.key} className="px-4 py-2 text-xs text-center border-r">
                <span
                  className={`${item.level === 0 || isResultRow || isTotalRow ? "font-medium" : "text-xs"} cursor-pointer hover:underline hover:text-primary transition-colors`}
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
          <td className="px-4 py-2 text-right text-sm">
            <span
              className={`${item.level === 0 || isResultRow || isTotalRow ? "font-semibold" : "text-xs"} cursor-pointer hover:underline hover:text-primary transition-colors`}
              onClick={() => {
                setSelectedColumn(item)
                setSelectedMonth(null)
                setIsModalOpen(true)
              }}
            >
              {item.totalValue === 0 ? '–' : isPercentRow ? `${item.totalValue?.toFixed(1)}` : item.totalValue?.toLocaleString('ru-RU')}
            </span>
          </td>
        </tr>
        {hasChildren && isExpanded && item.details.map(child => renderRow(child, true))}
      </React.Fragment>
    )
  }

  return (
    <div className="fixed left-[80px] w-[calc(100%-80px)] flex top-[60px] h-[calc(100%-60px)]">
      {/* P&L-specific Filter Sidebar */}
      <PnLFilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(!isFilterOpen)}
      />

      {loading && <ScreenLoader />}

      {/* Main Content */}
      <div className={"w-full relative bg-white overflow-auto pb-10"}>
        <div className="flex px-4 h-16 items-center sticky top-0 z-20 bg-white justify-between">
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

          <div className="flex items-center gap-3">
            <GroupedSelect
              data={groupingOptions}
              value={pnlStore.selectedGrouping}
              onChange={(value) => {
                pnlStore.setSelectedGrouping(value)
                pnlStore.fetchReport()
              }}
              placeholder="Способ построения"
              className="bg-white w-44"
            />
            <GroupedSelect
              data={accountingMethodOptions}
              value={pnlStore.isCalculation ? 'accrual' : 'cash'}
              onChange={(value) => {
                pnlStore.setIsCalculation(value === 'accrual')
                pnlStore.fetchReport()
              }}
              placeholder="Метод учета"
              className="bg-white w-44"
              autoHeight={true}
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

        {/* Table with loading overlay */}
        <div className='px-4 mt-2'>

          {!reportData && !loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: '16px', opacity: 0.3 }}>
                <path d="M8 16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V48C56 52.4183 52.4183 56 48 56H16C11.5817 56 8 52.4183 8 48V16Z" stroke="currentColor" strokeWidth="2" />
                <path d="M16 24H48M16 32H48M16 40H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: '16px', color: '#667085', marginBottom: '8px' }}>Выберите период для отображения отчета</p>
              <p style={{ fontSize: '14px', color: '#98A2B3' }}>Используйте фильтры слева для настройки параметров отчета</p>
            </div>
          ) : (
              <table className="w-full">
                <thead className={"bg-neutral-100 z-10 sticky top-16"}>
                  <tr>
                    <th className="text-left px-4 py-2 text-xs font-medium" style={{ minWidth: 320 }}>Статья</th>
                    {legend.map(period => (
                      <th key={period.key} className="text-center border-r border-neutral-300 px-4 py-2 text-xs font-medium" style={{ width: 110 }}>{period.title}</th>
                    ))}
                    <th className="text-center px-4 py-2 text-xs font-medium" style={{ width: 110 }}>Итого</th>
                  </tr>
                </thead>
              <tbody>
                {rows?.map(row => renderRow(row))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <OperationCashFlowModal
        type="pnl"
        data={selectedColumn}
        selectedMonth={selectedMonth}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
})

export default ProfitAndLossPage
