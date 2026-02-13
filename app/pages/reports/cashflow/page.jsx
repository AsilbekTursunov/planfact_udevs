"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
import { DateRangePicker } from '@/components/directories/DateRangePicker/DateRangePicker'
import { GroupedSelect } from '@/components/common/GroupedSelect/GroupedSelect'
import { getCashFlowReport } from '@/lib/api/ucode/cashflow'
import styles from './cashflow.module.scss'

export default function CashFlowReportPage() {
  const [expanded, setExpanded] = useState({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  
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
        
        // Calculate date range for last 6 months
        const endDate = new Date()
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 6)
        
        const formatDate = (date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }
        
        const response = await getCashFlowReport({
          periodStartDate: formatDate(startDate),
          periodEndDate: formatDate(endDate),
          periodType: selectedGrouping,
          currencyCode: 'RUB'
        })
        
        console.log('API Response:', response)
        console.log('Data path check:', {
          'response.data': response?.data,
          'response.data.data': response?.data?.data,
          'response.data.data.data': response?.data?.data?.data
        })
        
        // Структура ответа: response.data.data.data
        if (response?.data?.data?.data) {
          console.log('Setting report data:', response.data.data.data)
          setReportData(response.data.data.data)
        } else {
          console.error('Data not found in expected path')
        }
      } catch (error) {
        console.error('Error fetching cash flow report:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [selectedGrouping])

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
    
    return reportData.rows.map(row => transformRow(row, 0))
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
            <span className={isTopLevel ? styles.boldNumber : ''}>
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
            <span className={isTopLevel ? styles.boldNumber : ''}>
              {formatNumber(value)}
            </span>
          )
        },
      },
    ],
    [months, reportData]
  )

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
                <h1 className={styles.title}>Отчет о движении денежных средств</h1>
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
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
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
    </div>
  )
}
