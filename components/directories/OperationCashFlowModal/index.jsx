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
                    // Determine if this is income or expense based on row type or parent category
                    // In P&L, expenses are typically under "Расходы" or have negative impact
                    // We check the row name or type to determine the color
                    const isExpenseCategory = row.name?.toLowerCase().includes('расход') || 
                                             row.name?.toLowerCase().includes('себестоимость') ||
                                             row.name?.toLowerCase().includes('операционные') ||
                                             row.name?.toLowerCase().includes('административные') ||
                                             row.type === 'expense'
                    
                    // For P&L: if it's an expense category, show as negative (red) even if value is positive
                    // For Cashflow: use the sign of the value
                    const isIncome = isExpenseCategory ? false : value >= 0
                    const isRoot = row._depth === 0

                    return (
                      <tr key={row.id ?? idx} className={styles.tableRow}>
                        {/* Дата */}
                        <td className={styles.tdDate}>{periodLabel}</td>

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