import { useMemo, useState } from 'react'
import { cn } from '@/app/lib/utils'
import styles from './style.module.scss'
import PriceStatus from '@/components/operations/PriceStatus'
import { ExpendClose, ExpendOpen, TypeIncomeIcon, TypeExpenseIcon, TypeTransferIcon, ShipmentIcon } from '@/constants/icons'
import { observer } from 'mobx-react-lite'

const IncomePaymentTableRow = observer(({
  op,
}) => {
  const [open, setOpen] = useState(false)
  const children = new Set()
  const chartofaccounts = new Set()

  op.operationParts?.forEach(part => {
    children.add(part?.counterparties_id)
    chartofaccounts.add(part?.chart_of_accounts_id)
  })

  const titleContragent = useMemo(() => {
    if (children.size === 1) {
      return op.counterparty || ''
    } else if (children.size > 1) {
      return `${children.size || 2} [контрагента]`
    } else {
      return op.counterparty || ''
    }
  }, [children, op.counterparty])


  const titleChartOfAccounts = useMemo(() => {
    if (chartofaccounts.size === 1) {
      return op.chartOfAccounts || ''
    } else if (chartofaccounts.size > 1) {
      return `${chartofaccounts.size || 2} [статьи]`
    } else {
      return op.chartOfAccounts || ''
    }
  }, [chartofaccounts, op.chartOfAccounts])


  const isDifferentDate = op?.accrualDate !== op?.operationDate

  return (
    <>
      <tr key={op.guid} className=" text-xs! border-b ">
        {/* date */}
        <td className=" px-4 py-4">
          <div>
            {op.operationParts?.length > 0 ? <>
              <div className={styles.childrenControl} onClick={(event) => { event.stopPropagation(); setOpen(!open) }}>
                {open ? <ExpendClose /> : <ExpendOpen />}
                <span>{op?.operationDate}</span>
              </div>
            </> : <div className='flex flex-col items-start'>
              <span className=''>{op?.operationDate}</span>
              {isDifferentDate && <span className="text-mini text-neutral-400">{op?.accrualDate}</span>}
            </div>}
          </div>
        </td>
        {/* tip */}
        <td className=" text-center">
          {op.tip ? (
            <div className='flex justify-center items-center h-full'>
              {op.tip === 'Поступление' ? (
                <TypeIncomeIcon className="text-green-700" />
              ) : op.tip === 'Выплата' ? (
                <TypeExpenseIcon className="text-red-700" />
              ) : op.tip === 'Перемещение' ||
                op.tip === 'Начисление' ? (
                <TypeTransferIcon className="text-slate-700" />
              ) : op.tip === 'Отгрузка' && <ShipmentIcon />}
            </div>
          ) : null}
        </td>
        {/* counterparty */}
        <td className={"text-xs px-2"}>
          {op?.tip === 'Перемещение' ? op?.my_account_name : <>
            <p>{titleContragent}</p></>}
        </td>
        {/* statya */}
        <td className={"text-xs px-2"}>
          {op?.tip == "Перемещение" && <p >
            {op?.my_account_name2}
          </p>}
          {(op.tip === "Поступление" || op.tip === "Выплата") && <div className={`flex flex-col items-start `}>
            <span className={`text-neutral-700 ${!op.payment_confirmed && 'text-primary'}`}>{titleChartOfAccounts}</span>
            <span className='text-neutral-400'>{op.opisanie}</span>
          </div>}
        </td>
        {/* price */}
        <td className={'pr-4'} onClick={e => e.stopPropagation()}>
          <PriceStatus
            amount={op.summa}
            toAmount={op.to_amount}
            tab={op.tip}
            type={op?.tip}
            percent={op?.percent}
            confirmed={op.payment_confirmed}
            accrual={op.payment_accrual}
            currency={op.currency}
            dealId={op?.selling_deal_id}
            toCurrency={op?.to_currenies_kod}
          />
        </td>
      </tr>
      {open &&
        op.operationParts?.map(part => {
          return (
            <tr
              key={part.id}
              className={"border-b bg-gray-50 h-10"}>
              <td className={"text-xs pl-10"}>
                {part?.accrualDate}
              </td>
              <td className={""}>
                {part.tip ? (
                  <div className='flex justify-center items-center h-full'>
                    {op.tip === 'Поступление' ? (
                      <TypeIncomeIcon className="text-green-700" />
                    ) : op.tip === 'Выплата' ? (
                      <TypeExpenseIcon className="text-red-700" />
                    ) : op.tip === 'Перемещение' ||
                      op.tip === 'Начисление' ? (
                      <TypeTransferIcon className="text-slate-700" />
                    ) : op.tip === 'Отгрузка' && <ShipmentIcon />}
                  </div>
                ) : null}
              </td>
              <td className={""}>
                {part.counterparty || ''}
              </td>
              <td className={"text-xs px-2"}>
                {part?.type == 'Перемещение' ? (
                  <div className={`flex flex-col items-start`}>
                    <span>[Перемещение - списание]</span>
                    <span>[Перемещение - зачисление]</span>
                  </div>
                ) : (
                  <div className={`flex flex-col items-start`}>
                    <span className='text-neutral-700'>{part.chartOfAccounts || ''}</span>
                    <span className='text-neutral-400'>{op.opisanie}</span>
                  </div>
                )}
              </td>
              <td colSpan={2} className={styles.tableCell} onClick={e => e.stopPropagation()}>
                <PriceStatus
                  amount={part.summa}
                  tab={part?.tip}
                  type={part?.tip}
                  percent={part?.percent}
                  confirmed={part.payment_confirmed}
                  accrual={part.payment_accrual}
                  currency={part.currency}
                  dealId={op?.selling_deal_id}
                />
              </td>
            </tr>
          )
        })}
    </>
  )
})

export default IncomePaymentTableRow