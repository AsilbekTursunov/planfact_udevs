import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './OperationCashFlowModal.module.scss'
import { ExpenseArrow, IncomeArrow } from '../../../constants/icons'

/**
 * Recursively flatten a row and its subRows into a flat list.
 * Skips the root row itself — only its children are shown as "operations".
 */
const flattenRows = (row, depth = 0) => {
  const result = [{ ...row, _depth: depth }]
  if (Array.isArray(row.subRows) && row.subRows.length > 0) {
    row.subRows.forEach(child => {
      result.push(...flattenRows(child, depth + 1))
    })
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
  const getValue = (row) => {
    if (selectedMonth?.key) {
      return row.months?.[selectedMonth.key] ?? 0
    }
    return row.total ?? 0
  }

  const rows = !data ? [] : flattenRows(data, 0).filter(row => getValue(row) !== 0)

  const periodLabel = selectedMonth?.label || 'Итого'
  const totalAmount = data ? formatNumber(getValue(data)) : '—'

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
                    const isIncome = value >= 0
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
                            value > 0 ? styles.positive : value < 0 ? styles.negative : styles.neutral
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