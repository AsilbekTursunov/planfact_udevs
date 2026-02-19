import React, { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import { cn } from '@/app/lib/utils'
import styles from './OperationCashFlowModal.module.scss'

const defaultData = {
  period: '01 — 28 фев ’26',
  totalAmount: '69 895 051 ₽',
  operations: [
    {
      id: 1,
      date: '17 фев ’26',
      type: 'income',
      counterparty: '',
      article: 'Выручка от продаж',
      articleSub: 'jhgjhv',
      amount: '+767 767 €'
    }
  ]
}

const OperationCashFlowModal = ({ isOpen, onClose, data }) => {
  const { period, totalAmount, operations } = data || defaultData

  const columns = useMemo(() => [
    {
      accessorKey: 'date',
      header: 'Дата ▾',
    },
    {
      accessorKey: 'type',
      header: 'Тип',
      cell: ({ getValue }) => {
        const type = getValue()
        return type === 'income' ? (
          <div className={styles.typeIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ) : null
      }
    },
    {
      accessorKey: 'counterparty',
      header: 'Контрагент',
    },
    {
      accessorKey: 'article',
      header: 'Статья',
      cell: ({ row }) => (
        <>
          <span className={styles.articleName}>{row.original.article}</span>
          {row.original.articleSub && <span className={styles.articleSub}>{row.original.articleSub}</span>}
        </>
      )
    },
    {
      accessorKey: 'amount',
      header: 'Сумма',
      cell: ({ getValue }) => (
        <span className={cn(styles.amountCell, styles.positive)}>{getValue()}</span>
      )
    }
  ], [])

  const table = useReactTable({
    data: operations,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!isOpen) return null

  return (
    <>
      <div
        className={styles.overlay}
        onClick={onClose}
      />

      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            Операции по показателю «Операционный поток»
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Период отчета</span>
            <span className={styles.summaryValue}>{period}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Сумма операций</span>
            <span className={styles.summaryValue}>{totalAmount}</span>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className={styles.tableRow}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className={cn(styles.tableHeaderCell, header.column.id === 'amount' ? styles.tableHeaderCellRight : '')}>
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
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={styles.tableRow}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className={cn(styles.tableCell, styles[cell.column.id + 'Cell'])}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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