import React from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import PriceStatus from '@/components/operations/PriceStatus'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'

const OperationTableRow = ({
  op,
  selectedOperations,
  toggleOperation,
  openOperationModal,
  handleEditOperation,
  handleDeleteOperation,
  handleCopyOperation,
}) => {
  console.log("op", op)
  return (
    <tr
      key={op.id}
      className={cn(
        styles.tableRow,
        selectedOperations.includes(op.id) && styles.selected
      )}
      onClick={e => {
        if (!e.target.closest('input') && !e.target.closest('button')) {
          openOperationModal(op) 
        }
      }}
    >
      <td
        className={cn(styles.tableCell, styles.tableCellIndex)}
        onClick={e => e.stopPropagation()}
      >
        <OperationCheckbox
          checked={selectedOperations.includes(op.id)}
          onChange={() => toggleOperation(op.id)}
        />
      </td>
      <td className={cn(styles.tableCell, styles.dateCell)}>{op.operationDate || ''}</td>
      <td className={cn(styles.tableCell, styles.accountCell)}>
        {op.bankAccount || ''}
      </td>
      <td className={styles.tableCell}>
        {op.typeLabel ? (
          <div className={styles.typeIcon}>
            {op.typeLabel === 'Поступление' ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M15.8334 10.0001H4.16675M4.16675 10.0001L10.0001 15.8334M4.16675 10.0001L10.0001 4.16675'
                  stroke='#16a34a'
                  strokeWidth='1.33333'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : op.typeLabel === 'Выплата' ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M3.33325 10H16.6666M16.6666 10L11.6666 5M16.6666 10L11.6666 15'
                  stroke='#F04438'
                  strokeWidth='1.33333'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : op.typeLabel === 'Перемещение' ||
              op.typeLabel === 'Начисление' ? (
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M16.6666 14.1667H3.33325M3.33325 14.1667L6.66659 10.8333M3.33325 14.1667L6.66658 17.5M3.33325 5.83333H16.6666M16.6666 5.83333L13.3333 2.5M16.6666 5.83333L13.3333 9.16667'
                  stroke='#64748b'
                  strokeWidth='1.33333'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            ) : null}
          </div>
        ) : null}
      </td>
      <td className={cn(styles.tableCell, styles.counterpartyCell)}>
        {op.counterparty || ''}
      </td>
      <td className={cn(styles.tableCell, styles.statusCell)}>
        {op.chartOfAccounts || ''}
      </td>
      <td className={styles.tableCell}></td>
      <td className={styles.tableCell} onClick={e => e.stopPropagation()}>
        <PriceStatus
          amount={op.amount}
          type={op.typeCategory}
          confirmed={op.payment_confirmed}
          accrual={op.payment_accrual}
          currency={op.currency}
        />
      </td>
      <td
        className={cn(styles.tableCell, styles.tableCellActions)}
        onClick={e => e.stopPropagation()}
      >
        <OperationMenu
          operation={op}
          onEdit={handleEditOperation}
          onDelete={handleDeleteOperation}
          onCopy={handleCopyOperation}
        />
      </td>
    </tr>
  )
}

export default OperationTableRow