import { useMemo, useState } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import PriceStatus from '@/components/operations/PriceStatus'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'
import { ExpendClose, ExpendOpen, TypeIncomeIcon, TypeExpenseIcon, TypeTransferIcon } from '../../../constants/icons'

const OperationTableRow = ({
  op,
  selectedOperations,
  toggleOperation,
  openOperationModal,
  handleEditOperation,
  handleDeleteOperation,
  handleCopyOperation,
  counterpartyGuid,
  showIndex
}) => {
  const [open, setOpen] = useState(false)
  const children = new Set()

  op.operationParts?.forEach(part => {
    children.add(part?.counterpartyId)
  })

  const titleContragent = useMemo(() => {
    if (children.size === 1 && children.has(counterpartyGuid)) {
      return op.counterparty || ''
    } else if (children.size > 1) {
      return `${children.size || 2} статьи`
    } else {
      return op.counterparty || ''
    }
  }, [children, counterpartyGuid, op.bankAccount])

  return (
    <>
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
          {toggleOperation ? <OperationCheckbox
            checked={selectedOperations.includes(op.id)}
            onChange={() => toggleOperation(op.id)}
          /> : <span>{showIndex}</span>}
        </td>
        <td className={cn(styles.tableCell, styles.dateCell)}>
          {op.operationParts?.length > 0 ? <>
            <div className={styles.childrenControl} onClick={(event) => { event.stopPropagation(); setOpen(!open) }}>
              {open ? <ExpendClose /> : <ExpendOpen />}
              <span>{op?.operationDate}</span>
            </div>
          </> : op?.operationDate}
        </td>
        <td className={cn(styles.tableCell, styles.accountCell)}>
          {op?.type == "Перемещение" ? <>
            <div className={`${styles.doubleAccount} ${!op.paymentConfirmed && styles.confirmed}`}>
              <span>{op.bankAccount}</span>
              <span>{op.bankAccount2}</span>
            </div>
          </> : op.bankAccount || ''}
        </td>
        <td className={styles.tableCell}>
          {op.typeLabel ? (
            <div className={styles.typeIcon}>
              {op.typeLabel === 'Поступление' ? (
                <TypeIncomeIcon />
              ) : op.typeLabel === 'Выплата' ? (
                  <TypeExpenseIcon />
                ) : op.typeLabel === 'Перемещение' ||
                  op.typeLabel === 'Начисление' ? (
                <TypeTransferIcon />
              ) : null}
            </div>
          ) : null}
        </td>
        <td className={cn(styles.tableCell, styles.counterpartyCell)}>
          {titleContragent}
        </td>
        <td className={cn(styles.tableCell, styles.statusCell)}>
          {op?.type == "Перемещение" ? <div className={`${styles.doubleAccount} ${!op.paymentConfirmed && styles.confirmed}`}>
            <span>[Перемещение - списание]</span>
            <span>[Перемещение - зачисление]</span>
          </div> : op.chartOfAccounts || ''}
        </td>
        <td className={styles.tableCell}></td>
        <td className={styles.tableCell} onClick={e => e.stopPropagation()}>
          <PriceStatus
            amount={op.amount}
            tab={op.type}
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
      {open &&
        op.operationParts?.map(part => {
          return (
            <tr
              key={part.id}
              className={`${styles.tableRow} ${styles.child} ${counterpartyGuid !== part?.counterpartyId ? styles.disabled : ''}`}
              aria-disabled={counterpartyGuid === part?.counterpartyId}
              onClick={e => {
                if (!e.target.closest('input') && !e.target.closest('button') && counterpartyGuid === part?.counterpartyId) {
                  openOperationModal(part)
                }
              }}
            >
              <td colSpan={2}
                className={cn(styles.tableCell, styles.tableCellIndex)}
              />
              <td className={cn(styles.tableCell, styles.dateCell)}>
                {part?.accrualDate}
              </td>
              <td className={styles.tableCell}>
                {op.typeLabel ? (
                  <div className={styles.typeIcon}>
                    {op.typeLabel === 'Поступление' ? (
                      <TypeIncomeIcon />
                    ) : op.typeLabel === 'Выплата' ? (
                      <TypeExpenseIcon />
                    ) : op.typeLabel === 'Перемещение' ||
                      op.typeLabel === 'Начисление' ? (
                      <TypeTransferIcon />
                    ) : null}
                  </div>
                ) : null}
              </td>
              <td className={cn(styles.tableCell, styles.counterpartyCell)}>
                {part.counterparty || ''}
              </td>
              <td className={cn(styles.tableCell, styles.statusCell)}>
                {part?.type == 'Перемещение' ? (
                  <div
                    className={`${styles.doubleAccount} ${!part.paymentConfirmed && styles.confirmed
                      }`}
                  >
                    <span>[Перемещение - списание]</span>
                    <span>[Перемещение - зачисление]</span>
                  </div>
                ) : (
                  part.chartOfAccounts || ''
                )}
              </td>
              <td className={styles.tableCell}></td>
              <td colSpan={2} className={styles.tableCell} onClick={e => e.stopPropagation()}>
                <PriceStatus
                  amount={part.amount}
                  tab={part?.tip}
                  type={part.typeCategory}
                  confirmed={part.payment_confirmed}
                  accrual={part.payment_accrual}
                  currency={part.currency}
                />
              </td>
              {/* <td
              className={cn(styles.tableCell, styles.tableCellActions)}
              onClick={e => e.stopPropagation()}
            ></td> */}
            </tr>
          )
        })}
    </>
  )
}

export default OperationTableRow