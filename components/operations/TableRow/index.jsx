import { useMemo, useState } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import PriceStatus from '@/components/operations/PriceStatus'
import OperationCheckbox from '@/components/shared/Checkbox/operationCheckbox'
import { OperationMenu } from '@/components/operations/OperationsTable/OperationMenu'
import { ExpendClose, ExpendOpen, TypeIncomeIcon, TypeExpenseIcon, TypeTransferIcon, ShipmentIcon } from '../../../constants/icons'

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

  const isDifferentDate = op?.accrualDate !== op?.operationDate

  const isActive = !op?.payment_confirmed && !op?.payment_accrual

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
        <td className={cn(styles.tableCell, styles.dateCell, isActive && styles.activeRow)}>
          {op.operationParts?.length > 0 ? <>
            <div className={styles.childrenControl} onClick={(event) => { event.stopPropagation(); setOpen(!open) }}>
              {open ? <ExpendClose /> : <ExpendOpen />}
              <span>{op?.operationDate}</span>
            </div>
          </> : <div className='flex flex-col items-start'>
            <span className=''>{op?.operationDate}</span>
            {isDifferentDate && <span className="text-[10px] text-neutral-400">{op?.accrualDate}</span>}
          </div>}
        </td>
        <td className={cn(styles.tableCell, styles.accountCell, isActive && styles.activeRow)}>
          {op?.tip == "Перемещение" ? <>
            <div className={`${styles.doubleAccount} ${!op.paymentConfirmed && styles.confirmed}`}>
              <span>{op.my_account_name}</span>
              <span>{op.my_account_name_2}</span>
            </div>
          </> : op.my_account_name || ''}
        </td>
        <td className={styles.tableCell}>
          {op.tip ? (
            <div className={styles.typeIcon}>
              {op.tip === 'Поступление' ? (
                <TypeIncomeIcon />
              ) : op.tip === 'Выплата' ? (
                <TypeExpenseIcon />
                ) : op.tip === 'Перемещение' ||
                  op.tip === 'Начисление' ? (
                <TypeTransferIcon />
              ) : op.tip === 'Отгрузка' && <ShipmentIcon />}
            </div>
          ) : null}
        </td>
        <td className={cn(styles.tableCell, styles.counterpartyCell, isActive && styles.activeRow)}>
          {titleContragent}
        </td>
        <td className={cn(styles.tableCell, styles.statusCell, isActive && styles.activeRow)}>
          {op?.tip == "Перемещение" ? <div className={`${styles.doubleAccount} ${!op.paymentConfirmed && styles.confirmed}`}>
            <span>[Перемещение - списание]</span>
            <span>[Перемещение - зачисление]</span>
          </div> : op.chartOfAccounts || ''}
        </td>
        <td className={cn(styles.tableCell, isActive && styles.activeRow)}>{op?.project_name || '-'}</td>
        <td className={cn(styles.tableCell, isActive && styles.activeRow)}>{op?.selling_deal_name || '-'}</td>
        <td className={styles.tableCell} onClick={e => e.stopPropagation()}>
          <PriceStatus
            amount={op.summa}
            tab={op.tip}
            type={op?.tip}
            confirmed={op.payment_confirmed}
            accrual={op.payment_accrual}
            currency={op.currency}
            dealId={op?.selling_deal_id}
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
              className={`${styles.tableRow} ${styles.child} ${counterpartyGuid && counterpartyGuid !== part?.counterpartyId ? styles.disabled : ''}`}
              aria-disabled={counterpartyGuid && counterpartyGuid === part?.counterpartyId}
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
                {part.tip ? (
                  <div className={styles.typeIcon}>
                    {part.tip === 'Поступление' ? (
                      <TypeIncomeIcon />
                    ) : part.tip === 'Выплата' ? (
                      <TypeExpenseIcon />
                      ) : part.tip === 'Перемещение' ||
                        part.tip === 'Начисление' ? (
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
              <td className={styles.tableCell}>{part?.project_name || '-'}</td>
              <td className={styles.tableCell}>{part?.selling_deal_name || '-'}</td>
              <td colSpan={2} className={styles.tableCell} onClick={e => e.stopPropagation()}>
                <PriceStatus
                  amount={part.summa}
                  tab={part?.tip}
                  type={part?.tip}
                  confirmed={part.payment_confirmed}
                  accrual={part.payment_accrual}
                  currency={part.currency}
                />
              </td>
            </tr>
          )
        })}
    </>
  )
}

export default OperationTableRow