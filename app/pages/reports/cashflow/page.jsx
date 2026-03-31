"use client"

import React, { useMemo, useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
import SingleSelect from '@/components/shared/Selects/SingleSelect'
import CashFlowFilterSidebar from '@/components/reports/cashflow/FilterSidebar'
import { cashFlowStore } from '@/components/reports/cashflow/cashflow.store'
import styles from './cashflow.module.scss'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'
import { toJS } from 'mobx'
import { GlobalCurrency } from '../../../../constants/globalCurrency'

const groupingOptions = [
  { value: 'monthly', label: 'По месяцам' },
  { value: 'quarterly', label: 'По кварталам' },
  { value: 'yearly', label: 'По годам' }
]

export default observer(function CashFlowReportPage() {
  const [expanded, setExpanded] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)


  const { reportData: cashFlowData, isLoading, isFetching } = cashFlowStore
  const loading = isLoading || isFetching

  const currencies = toJS(cashFlowData)?.currencies?.map(item => ({
    value: item.code,
    label: item.code
  }))


  // Refetch data every time user enters the page
  useEffect(() => {
    cashFlowStore.fetchReport()
  }, [])

  // Extract months from legend
  const months = useMemo(() => {
    if (!cashFlowData?.legend) return []
    return cashFlowData.legend.map(item => item.key)
  }, [cashFlowData])

  // Transform API data into hierarchical structure
  const data = useMemo(() => {
    if (!cashFlowData?.rows) return []

    const transformRow = (row, depth = 0) => {
      const monthData = {}
      months.forEach(monthKey => {
        monthData[monthKey] = row.values?.[monthKey] || 0
      })

      const node = {
        id: row.id,
        name: row.name,
        total: row.totalValue || 0,
        months: monthData,
        level: depth,
        subRows: []
      }

      if (row.details && Array.isArray(row.details) && row.details.length > 0) {
        node.subRows = row.details.map(detail => transformRow(detail, depth + 1))
      }

      return node
    }

    return cashFlowData?.rows?.map(row => transformRow(row, 0))
  }, [cashFlowData, months])

  // Auto-expand every top-level row that has children on first load
  const didAutoExpand = useRef(false)
  useEffect(() => {
    if (didAutoExpand.current) return
    if (!Array.isArray(data) || data.length === 0) return

    const initial = {}
    data.forEach((row, index) => {
      if (Array.isArray(row.subRows) && row.subRows.length > 0) {
        initial[String(index)] = true
      }
    })

    if (Object.keys(initial).length > 0) {
      setExpanded(initial)
      didAutoExpand.current = true
    }
  }, [data])

  // Format month for display
  const formatMonth = React.useCallback((monthKey) => {
    if (!cashFlowData?.legend) return monthKey
    const legendItem = cashFlowData.legend.find(item => item.key === monthKey)
    return legendItem?.title || monthKey
  }, [cashFlowData])

  // Format number
  const formatNumber = (value) => {
    if (value === 0 || value === null || value === undefined) return '-'
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'По статьям учета',
        size: 400,
        minSize: 400,
        cell: ({ row, getValue }) => {
          const value = getValue()
          const hasSubRows = row.subRows?.length > 0
          const isExpanded = row.getIsExpanded()

          return (
            <div
              style={{
                paddingLeft: `${row.depth * 1.5}rem`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: hasSubRows ? 'pointer' : 'default'
              }}
              onClick={hasSubRows ? row.getToggleExpandedHandler() : undefined}
            >
              {hasSubRows && (
                <button className={styles.expandButton}>
                  {isExpanded ? <ExpendClose /> : <ExpendOpen />}
                </button>
              )}
              <span className={row.depth === 0 ? styles.boldText : ''}>{value}</span>
            </div>
          )
        },
      },
      // Dynamic month columns
      ...months.map(month => ({
        accessorFn: row => row.months?.[month],
        id: month,
        header: formatMonth(month),
        size: 100,
        minSize: 100,
        maxSize: 100,
        cell: ({ getValue, row }) => {
          const value = getValue()
          const isTopLevel = row.depth === 0
          return (
            <span
              className={`${isTopLevel ? styles.boldNumber : ''} ${styles.clickableCell}`}
              onClick={() => {
                setSelectedColumn(row?.original)
                setSelectedMonth({ key: month, label: formatMonth(month) })
                setIsModalOpen(true)
              }}
            >
              {formatNumber(value)}
            </span>
          )
        },
      })),
      {
        accessorKey: 'total',
        header: 'Итого',
        size: 100,
        minSize: 100,
        maxSize: 100,
        cell: ({ getValue, row }) => {
          const value = getValue()
          const isTopLevel = row.depth === 0
          return (
            <span
              className={`${isTopLevel ? styles.boldNumber : ''} ${styles.clickableCell}`}
              onClick={() => {
                setSelectedColumn(row?.original)
                setSelectedMonth(null)
                setIsModalOpen(true)
              }}
            >
              {formatNumber(value)}
            </span>
          )
        },
      },
    ],
    [months, formatMonth]
  )

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Cashflow-specific Filter Sidebar */}
        <CashFlowFilterSidebar
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
              <h1 className='text-xl whitespace-nowrap font-semibold'>Отчет о движении денежных средств</h1>
              <SingleSelect
                data={currencies}
                value={cashFlowStore.filters.currencyCode || GlobalCurrency.code}
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

          <div className={`${styles.tableContainer} ${isFilterOpen ? styles.tableContainerWithFilter : ''}`} style={{ position: 'relative' }}>
            {/* Loading overlay */}
            {loading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.loadingSpinner} />
                <span>Загрузка данных...</span>
              </div>
            )}
            <table className={`${styles.table} ${loading ? styles.tableLoading : ''}`}>
              <thead className={styles.thead}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className={styles.th}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className={styles.tbody}>
                {table.getRowModel().rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${styles.tr} ${row.depth === 0 && index > 0 ? styles.topLevelRow : ''}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className={styles.td}
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
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
