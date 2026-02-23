"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { useBankAccountsPlanFact, useCounterpartiesGroupsPlanFact, useCashFlowReport } from '@/hooks/useDashboard'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { ReportFilterSidebar } from '@/components/reports/ReportFilterSidebar/ReportFilterSidebar'
import styles from './cashflow.module.scss'
import '@/styles/report-filters.css'
import OperationCashFlowModal from '@/components/directories/OperationCashFlowModal'
import { ExpendClose, ExpendOpen } from '../../../../constants/icons'

export default function CashFlowReportPage() {
  const [expanded, setExpanded] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null) // { key, label } or null for total

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedEntity, setSelectedEntity] = useState('all')
  const [dateRange, setDateRange] = useState(null)
  const [selectedGrouping, setSelectedGrouping] = useState('monthly')
  const [selectedBankAccounts, setSelectedBankAccounts] = useState([])
  const [selectedCounterparties, setSelectedCounterparties] = useState([])

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



  // Calculate dates based on period OR dateRange
  const dateParams = useMemo(() => {
    const formatDate = (date) => {
      if (!date) return ''
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    let startStr = ''
    let endStr = ''

    // 1. If dateRange is explicitly selected by user via custom DatePicker
    if (dateRange && (Array.isArray(dateRange) ? dateRange.length > 0 : (dateRange.startDate || dateRange.start || dateRange.endDate || dateRange.end))) {
      if (Array.isArray(dateRange) && dateRange.length >= 1 && dateRange[0]) {
        startStr = formatDate(new Date(dateRange[0]))
        endStr = formatDate(new Date(dateRange[dateRange.length - 1]))
      } else if (typeof dateRange === 'object') {
        const s = dateRange.startDate || dateRange.start
        const e = dateRange.endDate || dateRange.end || s
        if (s) startStr = formatDate(new Date(s))
        if (e) endStr = formatDate(new Date(e))
      }
    }
    // 2. Otherwise use selectedPeriod presets
    else {
      const today = new Date()
      // Optional: Add 1 day to include today entirely if needed
      // today.setDate(today.getDate() + 1)
      const currentYear = today.getFullYear()

      switch (selectedPeriod) {
        case 'q1':
          startStr = `${currentYear}-01-01`
          endStr = formatDate(new Date(currentYear, 3, 0)) // Last day of March
          break
        case 'q2':
          startStr = `${currentYear}-04-01`
          endStr = formatDate(new Date(currentYear, 6, 0)) // Last day of June
          break
        case 'h1':
          startStr = `${currentYear}-01-01`
          endStr = formatDate(new Date(currentYear, 6, 0)) // Last day of June
          break
        case 'year':
          startStr = `${currentYear}-01-01`
          endStr = `${currentYear}-12-31`
          break
        case 'all':
        default:
          endStr = formatDate(today)
          const startParams = new Date(today)
          startParams.setMonth(startParams.getMonth() - 6)
          startStr = formatDate(startParams)
          break
      }
    }

    return {
      periodStartDate: startStr,
      periodEndDate: endStr,
    }
  }, [dateRange, selectedPeriod])

  // Prepare query parameters
  const reportQueryParams = useMemo(() => {
    const params = {
      ...dateParams,
      periodType: selectedGrouping,
      currencyCode: 'RUB',
    }

    if (selectedEntity && selectedEntity !== 'all') {
      params.legalEntityId = [selectedEntity]
    }

    if (selectedBankAccounts && selectedBankAccounts.length > 0) {
      params.accountId = selectedBankAccounts
    }

    if (selectedCounterparties && selectedCounterparties.length > 0) {
      params.counterparties = selectedCounterparties
    }

    return params
  }, [dateParams, selectedGrouping, selectedEntity, selectedBankAccounts, selectedCounterparties])

  // Fetch report data
  const { data: rawReportData, isLoading, isFetching } = useCashFlowReport(reportQueryParams)

  const reportData = rawReportData?.data?.data?.data || null
  const loading = isLoading || isFetching


  // Extract months from legend
  const months = useMemo(() => {
    if (!reportData?.legend) return []
    return reportData.legend.map(item => item.key)
  }, [reportData])
  // Transform API data into hierarchical structure
  const data = useMemo(() => {
    if (!reportData?.rows) return []

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

      // Проверяем наличие details (дочерних элементов)
      if (row.details && Array.isArray(row.details) && row.details.length > 0) {
        node.subRows = row.details.map(detail => transformRow(detail, depth + 1))
      }

      return node
    }

    return reportData?.rows?.map(row => transformRow(row, 0))
  }, [reportData, months])

  // Auto-expand every top-level row that has children on first load
  const didAutoExpand = useRef(false)
  useEffect(() => {
    if (didAutoExpand.current) return
    if (!Array.isArray(data) || data.length === 0) return

    // TanStack Table uses index-based row IDs by default: "0", "1", "2", …
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
  const formatMonth = (monthKey) => {
    if (!reportData?.legend) return monthKey
    const legendItem = reportData.legend.find(item => item.key === monthKey)
    return legendItem?.title || monthKey
  }

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
                <button
                  className={styles.expandButton}
                >
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
    [months, reportData]
  )
  // bank accounts
  const { data: bankAccountsData } = useBankAccountsPlanFact({
    page: 1,
    limit: 100,
  })

  const bankAccounts = useMemo(() => {
    const items = bankAccountsData?.data?.data?.data || []

    return items.map(item => ({
      value: item.guid,
      label: item.nazvanie || '',
    }))
  }, [bankAccountsData])


  // counterparties groups
  const { data: counterpartiesGroupsData } = useCounterpartiesGroupsPlanFact({
    page: 1,
    limit: 100,
  })



  const counterpartiesGroupsItems = useMemo(() => {
    const items = counterpartiesGroupsData?.data?.data?.data || []
    return items.filter(item => item.children?.length > 0 ? items : null)
  }, [counterpartiesGroupsData])


  const counterpartiesGroupsOptions = useMemo(() => {
    return counterpartiesGroupsItems.map(item => [{ value: '', label: item.nazvanie_gruppy, group: item.nazvanie_gruppy }, ...item.children.map(child => ({
      value: child.guid,
      label: child.nazvanie || '',
      group: item.nazvanie_gruppy
    }))]
    ).flat()
  }, [counterpartiesGroupsItems])




  const table = useReactTable({
    data,
    columns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: row => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  const handleReset = () => {
    setSelectedPeriod('all')
    setSelectedEntity('all')
    setDateRange(null)
    setSelectedBankAccounts([])
    setSelectedCounterparties([])
  }

  // Remove the full-page blocking loader. 
  // We keep the old data visible by not returning early here.
  // Instead, we just let the isFetching state show a small spinner indicator if needed.
  // if (loading && !reportData) { ... }


  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Filter Sidebar */}
        <ReportFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          periodOptions={periodOptions}
          selectedPeriod={selectedPeriod}
          onPeriodChange={(val) => {
            setSelectedPeriod(val)
            setDateRange(null) // clear custom date when preset is chosen
          }}
          entityOptions={entityOptions}
          selectedEntity={selectedEntity}
          onEntityChange={setSelectedEntity}
          dateRange={dateRange}
          onDateRangeChange={(val) => {
            setDateRange(val)
            if (val) {
              setSelectedPeriod(null) // clear preset when custom date is chosen
            }
          }}
          accountOptions={bankAccounts}
          selectedAccounts={selectedBankAccounts}
          onAccountsChange={(value) => {
            setSelectedBankAccounts(value)
          }}
          counterpartyOptions={counterpartiesGroupsOptions}
          selectedCounterparties={selectedCounterparties}
          onCounterpartiesChange={(value) => {
            setSelectedCounterparties(value)
          }}
        />

        {/* Filter Toggle Bar */}
        {!isFilterOpen && (
          <div className={styles.filterToggleBar} onClick={() => setIsFilterOpen(true)}>
            <button className={styles.filterToggleBarButton}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <h1 className={styles.title}>Отчет о движении денежных средств</h1>
              </div>
              <div className={styles.headerRight}>
                <GroupedSelect
                  data={groupingOptions}
                  value={selectedGrouping}
                  onChange={(value) => setSelectedGrouping(value)}
                  placeholder="Способ построения"
                  className={styles.groupingSelect}
                />
                <button className={styles.moreButton}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="3" r="1" fill="currentColor" />
                    <circle cx="8" cy="8" r="1" fill="currentColor" />
                    <circle cx="8" cy="13" r="1" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className={`${styles.tableContainer} ${isFilterOpen ? styles.tableContainerWithFilter : ''}`}>
            {loading && !reportData ? (
              <div className={styles.loadingOverlay}>Загрузка данных...</div>
            ) : null}
            <table className={`${styles.table} ${loading ? styles.tableLoading : ''}`}>
              <thead className={styles.thead}>
                {table.getHeaderGroups().map(headerGroup => {
                  console.log(headerGroup)
                  return (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className={styles.th}
                          style={{ width: header.getSize() }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </th>
                      ))}
                    </tr>
                  )
                })}
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
      <OperationCashFlowModal data={selectedColumn} selectedMonth={selectedMonth} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
