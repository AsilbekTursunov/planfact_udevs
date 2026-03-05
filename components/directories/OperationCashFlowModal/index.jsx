import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './OperationCashFlowModal.module.scss'
import { ExpenseArrow, IncomeArrow } from '../../../constants/icons'

/**
 * Recursively flatten a row and its subRows into a flat list.
 * Skips the root row itself — only its children are shown as "operations".
 */
const flattenRows = (row, depth = 0) => {
  const result = []
  if (Array.isArray(row.subRows) && row.subRows.length > 0) {
    row.subRows.forEach(child => {
      // For children, we want to include them in the operations list
      // If a child has its own subRows, we just flatten those too instead of adding the child group wrapper
      if (Array.isArray(child.subRows) && child.subRows.length > 0) {
        result.push(...flattenRows(child, depth + 1))
      } else {
        result.push({ ...child, _depth: depth + 1 })
      }
    })
  } else if (Array.isArray(row.details) && row.details.length > 0) {
    // Handling P&L data structure where children are in `details` instead of `subRows` pending on transformation
    row.details.forEach(child => {
      if (Array.isArray(child.details) && child.details.length > 0) {
        result.push(...flattenRows(child, depth + 1))
      } else {
        result.push({ ...child, _depth: depth + 1 })
      }
    })
  } else {
    // If it's a leaf node itself, just show it
    result.push({ ...row, _depth: depth })
  }
  return result
}

const formatAmount = (value) => {
  if (value === 0 || value === null || value === undefined) return '—'
  const abs = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(value))
  return (value > 0 ? '+' : '−') + abs + ' ₽'
}

const formatNumber = (value) => {
  if (value === 0 || value === null || value === undefined) return '—'
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}



const OperationCashFlowModal = ({ isOpen, onClose, data, selectedMonth }) => {
  const [expandedRows, setExpandedRows] = React.useState({})
  
  console.log('🔵 OperationCashFlowModal - Props:', { isOpen, data, selectedMonth })
  
  const getValue = (row) => {
    if (selectedMonth?.key) {
      // Try both 'values' (P&L) and 'months' (Cashflow) structures
      return row.values?.[selectedMonth.key] ?? row.months?.[selectedMonth.key] ?? 0
    }
    // Try both 'totalValue' (P&L) and 'total' (Cashflow) structures
    return row.totalValue ?? row.total ?? 0
  }

  const rows = !data ? [] : flattenRows(data, 0).filter(row => getValue(row) !== 0)
  
  console.log('🔵 OperationCashFlowModal - Flattened rows:', rows)
  console.log('🔵 OperationCashFlowModal - Rows count:', rows.length)

  const periodLabel = selectedMonth?.label || 'Итого'
  const totalAmount = data ? formatNumber(getValue(data)) : '—'
  
  console.log('🔵 OperationCashFlowModal - Period:', periodLabel)
  console.log('🔵 OperationCashFlowModal - Total amount:', totalAmount)

  // Toggle row expansion
  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }))
  }

  // Mock detail data - replace with real data later
  const getDetailData = (rowId) => {
    return [
      { id: 1, date: '05 мар \'26', counterparty: 'test', article: 'Оказание услуг', amount: 15000000 },
      { id: 2, date: '31 мар \'26', counterparty: 'test', article: 'Оказание услуг', amount: 4500000 },
      { id: 3, date: '30 апр \'26', counterparty: 'test', article: 'Оказание услуг', amount: 9000000 },
    ]
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            {data?.name || 'Операции по показателю'}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Период отчета</span>
            <span className={styles.summaryValue}>{periodLabel}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Сумма операций</span>
            <span className={styles.summaryValue}>{totalAmount}</span>
          </div>
        </div>

        {/* Table */}
        <div className={styles.content}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.thDate}>Дата ▾</th>
                  <th className={styles.thType}>Тип</th>
                  <th className={styles.thCounterparty}>Контрагент</th>
                  <th className={styles.thArticle}>Статья</th>
                  <th className={styles.thAmount}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>Нет данных</td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const value = getValue(row)
                    const isExpenseCategory = row.name?.toLowerCase().includes('расход') || 
                                             row.name?.toLowerCase().includes('себестоимость') ||
                                             row.name?.toLowerCase().includes('операционные') ||
                                             row.name?.toLowerCase().includes('административные') ||
                                             row.type === 'expense'
                    
                    const isIncome = isExpenseCategory ? false : value >= 0
                    const isRoot = row._depth === 0
                    const rowId = row.id ?? idx
                    const isExpanded = expandedRows[rowId]
                    const detailData = isExpanded ? getDetailData(rowId) : []

                    return (
                      <React.Fragment key={rowId}>
                        <tr className={styles.tableRow}>
                          {/* Дата */}
                          <td className={styles.tdDate}>
                            <div className={styles.dateCell}>
                              <button
                                className={styles.expandButton}
                                onClick={() => toggleRowExpansion(rowId)}
                              >
                                <svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <rect x="1.42383" y="0.5" width="13" height="13" rx="2.5" stroke="#999999"></rect>
                                  <path d="M10.9223 6.87934H4.92535" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                  {!isExpanded && (
                                    <path d="M7.92383 3.88086V9.87782" stroke="#999999" strokeLinecap="round" strokeLinejoin="round"></path>
                                  )}
                                </svg>
                              </button>
                              <span>{periodLabel}</span>
                            </div>
                          </td>

                          {/* Тип */}
                          <td className={styles.tdType}>
                            {value !== 0 && (
                              isIncome ? <IncomeArrow /> : <ExpenseArrow />
                            )}
                          </td>

                          {/* Контрагент */}
                          <td className={styles.tdCounterparty}>—</td>

                          {/* Статья */}
                          <td className={styles.tdArticle}>
                            <span
                              className={styles.articleName}
                              style={{ fontWeight: 500 }}
                            >
                              {row.name}
                            </span>
                          </td>

                          {/* Сумма */}
                          <td className={styles.tdAmount}>
                            <span className={cn(
                              styles.amountValue,
                              isIncome ? styles.positive : styles.negative
                            )}>
                              {formatAmount(value)}
                            </span>
                          </td>
                        </tr>
                        
                        {/* Detail rows */}
                        {isExpanded && detailData.map((detail) => (
                          <tr key={`${rowId}-detail-${detail.id}`} className={styles.detailRow}>
                            <td className={styles.tdDate}>
                              <div className={styles.detailDateCell}>
                                {detail.date}
                              </div>
                            </td>
                            <td className={styles.tdType}>
                              {detail.amount >= 0 ? <IncomeArrow /> : <ExpenseArrow />}
                            </td>
                            <td className={styles.tdCounterparty}>{detail.counterparty}</td>
                            <td className={styles.tdArticle}>
                              <span className={styles.detailArticleName}>{detail.article}</span>
                            </td>
                            <td className={styles.tdAmount}>
                              <span className={cn(
                                styles.detailAmountValue,
                                detail.amount >= 0 ? styles.positive : styles.negative
                              )}>
                                {formatAmount(detail.amount)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <a onClick={() => { }} className={styles.openLink}>
            Открыть в разделе Операции
          </a>
          <button onClick={onClose} className={styles.closeFooterButton}>
            Закрыть
          </button>
        </div>
      </div>
    </>
  )
}

export default OperationCashFlowModal