import { useMemo } from 'react'
import styles from './OperationCashFlowModal.module.scss'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import operationsDto from '../../../lib/dtos/operationsDto'
import IncomePaymentTableRow from './CashFlowTablesRows/IncomePaymentRow'
import { Loader2 } from 'lucide-react'
import { GlobalCurrency } from '../../../constants/globalCurrency'
import { formatAmount, formatPeriod } from '../../../utils/helpers'
import { cashFlowStore } from '../../reports/cashflow/cashflow.store'
import { observer } from 'mobx-react-lite'
import { toJS } from 'mobx'


import { pnlStore } from '../../reports/profit-and-loss/pnl.store'

const returnSingleName = (name) => {
  switch (name) {
    case "Поступления":
      return ["Поступление"]
    case "Выплаты":
      return ["Выплата"]
    case "Списания":
      return ["Списание", "Перемещение"]
    case "Зачисления":
      return ["Зачисление", "Перемещение"]
    case "Перемещения":
      return ["Списание", "Зачисление", "Перемещение"]
    case "Операционный поток":
      return ["Поступление", "Выплата"]
    case "Инвестиционный поток":
      return ["Поступление", "Выплата"]
    case "Финансовый поток":
      return ["Поступление", "Выплата"]
    default:
      return null
  }
}

const formatDateLocal = (date) => {
  if (!date) return null
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const OperationCashFlowModal = observer(({ isOpen, onClose, data, selectedMonth, type = "cashflow" }) => {
  const months = formatPeriod(
    type === 'pnl' ? pnlStore.dateRange.start : cashFlowStore.filters.periodStartDate,
    type === 'pnl' ? pnlStore.dateRange.end : cashFlowStore.filters.periodEndDate
  )

  console.log('data', toJS(data))

  const dateRange = useMemo(() => {
    if (selectedMonth?.key) {
      const [year, month] = selectedMonth.key.split('-').map(Number)
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
      return { start: startDate, end: endDate }
    }

    if (type === 'pnl') {
      return {
        start: formatDateLocal(pnlStore.dateRange.start),
        end: formatDateLocal(pnlStore.dateRange.end)
      }
    }

    return {
      start: cashFlowStore.filters.periodStartDate,
      end: cashFlowStore.filters.periodEndDate
    }
  }, [selectedMonth, type])

  const tips = useMemo(() => {
    if (type === 'pnl') {
      return true // returning truthy to keep the query enabled
    }

    if (!data) return null

    // 1. High-level flows
    if (['Операционный поток', 'Инвестиционный поток', 'Финансовый поток'].includes(data.name)) {
      return { tip: ['Поступление', 'Выплата'] }
    }

    // 2. Section-based logic (Receipts/Payments/Transfers)
    if (data.section === 'Поступления') {
      return { tip: ['Поступление'] }
    }
    if (data.section === 'Выплаты') {
      return { tip: ['Выплата'] }
    }
    if (data.section === 'Списания') {
      return { tip: ['Списание', 'Перемещение'] }
    }
    if (data.section === 'Зачисления') {
      return { tip: ['Зачисление', 'Перемещение'] }
    }

    // 3. Fallback to existing single name mapping
    const mappedTip = returnSingleName(data.name)
    if (mappedTip) {
      return { tip: mappedTip }
    }

    return {}
  }, [data, type])

  const chartOfAccountIds = useMemo(() => {
    if (type !== 'pnl' || !data) return undefined;

    const collectIds = (node) => {
      let ids = [];
      // Only push node.id if it contains at least one number (like a UUID format)
      if (typeof node.id === 'string' && /\d/.test(node.id)) {
        ids.push(node.id);
      }
      // If there are child details, recursively collect their IDs
      if (node.details && Array.isArray(node.details)) {
        node.details.forEach(child => {
          ids.push(...collectIds(child));
        });
      }
      return ids;
    };

    const result = collectIds(data);
    return result.length > 0 ? result : undefined;
  }, [type, data]);

  const { data: cashflowData, isLoading } = useUcodeRequestQuery({
    method: 'find_operations',
    data: {
      ...(type === 'cashflow' ? {
        ...tips,
        paymentConfirmed: true,
        paymentNotConfirmed: false,
      } : {
        tip: ["Списание", "Зачисление", "Перемещение", "Выплата", "Поступление", "Отгрузка", "Дебет", "Кредит", "Начисление"],
        paymentAccural: true,
        paymentNotAccural: false,
        ...(chartOfAccountIds?.length > 0 ? { chart_of_accounts_ids: chartOfAccountIds } : {})
      }),
      paymentDateStart: dateRange.start,
      paymentDateEnd: dateRange.end,
    },
    querySetting: {
      enabled: !!tips && !!isOpen,
      select: response => response?.data?.data,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  })

  const totalSummary = useMemo(() => {
    if (type === 'pnl') {
      // In PnL, we don't have existing explicit logic for total summary mapping yet, but we could try reading net_cash_flow 
      // or simply returning the value coming from the cell itself (which we can access via data?). For now using net_cash_flow.
      return cashflowData?.totalSummary?.net_cash_flow || 0
    }

    switch (data?.name) {
      case "Операционный поток":
        return cashflowData?.totalSummary?.net_cash_flow
      case "Инвестиционный поток":
        return cashflowData?.totalSummary?.net_cash_flow
      case "Финансовый поток":
        return cashflowData?.totalSummary?.net_cash_flow
      case "Списания":
        return cashflowData?.totalSummary?.by_type?.transfer?.total_summa
      case "Зачисления":
        return cashflowData?.totalSummary?.by_type?.transfer?.total_summa
      case "Перемещения":
        return cashflowData?.totalSummary?.by_type?.transfer?.total_summa
      case "Поступления":
        return cashflowData?.totalSummary?.by_type?.receipt?.total_summa
      case "Выплаты":
        return cashflowData?.totalSummary?.by_type?.payment?.total_summa
      default:
        return cashflowData?.totalSummary?.net_cash_flow
    }
  }, [cashflowData, data?.name, type])

  const operationsList = useMemo(() => {
    return {
      future: operationsDto(cashflowData?.data, 'future'),
      today: operationsDto(cashflowData?.data, 'today'),
      before: operationsDto(cashflowData?.data, 'before'),
    }
  }, [cashflowData])

  console.log('operationsList', operationsList)




  const isTransfer = type === 'cashflow' && (data?.name === 'Зачисления' || data?.name === 'Списания' || data?.name === 'Перемещения')



  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            Операции {data?.name || 'Операции по показателю'}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Summary */}
        <div className="flex flex-col gap-2 p-4">
          <div className="flex text-sm items-center gap-10">
            <span className=" font-medium">Период отчета</span>
            <span className="">{months}</span>
          </div>
          <div className="flex text-sm items-center gap-10">
            <span className=" font-medium">Сумма операций</span>
            <div className="flex items-center gap-2">
              <span>{(data?.name === 'Списания') ? '-' : ''}{formatAmount(Number(totalSummary).toFixed(2))}</span>
              <span>{GlobalCurrency.name}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className=" overflow-auto h-[500px]">
          {isLoading ? <div className='w-full h-full flex items-center justify-center'>
            <Loader2 className='animate-spin text-primary' size={30} />
          </div> : <table className="w-full relative">
              <thead className="sticky top-0 z-10 h-10 bg-neutral-50  border-b box-content border-gray-300">
              <tr className=' text-xs text-neutral-600 '>
                <th className=" px-4 text-start">Дата ▾</th>
                <th className=" px-4 text-center">Тип</th>
                  <th className=" px-2 text-start">{isTransfer ? 'Откуда' : 'Контрагент'}</th>
                  <th className=" px-2 text-start">{isTransfer ? 'Куда' : 'Статья'}</th>
                <th className=" px-4 text-end">Сумма</th>
              </tr>
            </thead>
            <tbody>
                {(!operationsList?.before?.length && !operationsList?.today?.length && !operationsList?.future?.length) ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>Нет данных</td>
                  </tr>
                ) : (
                    <>
                      {operationsList?.future?.length > 0 && (
                        <tr className=" border-y border-y-gray-100 bg-neutral-50">
                          <td colSpan='5' className=" py-1 text-xs px-4">
                            <h3 className="">После</h3>
                          </td>
                        </tr>
                      )}
                      {operationsList?.future?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={data?.name} />)}

                      {operationsList?.today?.length > 0 && (
                        <tr className=" border-y border-y-gray-100 bg-neutral-50">
                          <td colSpan='5' className=" py-1 text-xs px-4">
                            <h3 className="">Сегодня</h3>
                          </td>
                        </tr>
                      )}
                      {operationsList?.today?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={data?.name} />)}

                      {operationsList?.before?.length > 0 && (
                        <tr className=" border-y border-y-gray-100 bg-neutral-50">
                          <td colSpan='5' className=" py-1 text-xs px-4">
                            <h3 className="">До</h3>
                          </td>
                        </tr>
                      )}
                      {operationsList?.before?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={data?.name} />)}
                    </>
                )}
              </tbody>
          </table>}
        </div>

        {/* Footer */}
        <div className="p-2 flex justify-end gap-3 border-t">
          {/* <a onClick={() => { }} className="secondary-btn">
            Открыть в разделе Операции
          </a> */}
          <button onClick={onClose} className="primary-btn">
            Закрыть
          </button>
        </div>
      </div>
    </>
  )
})

export default OperationCashFlowModal
