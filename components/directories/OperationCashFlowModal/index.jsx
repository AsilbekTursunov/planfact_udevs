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

const OperationCashFlowModal = observer(({ isOpen, onClose, data, selectedMonth }) => {
  const months = formatPeriod(
    cashFlowStore.filters.periodStartDate,
    cashFlowStore.filters.periodEndDate
  )

  const dateRange = useMemo(() => {
    if (!selectedMonth?.key) return { start: null, end: null }
    const [year, month] = selectedMonth.key.split('-').map(Number)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    return { start: startDate, end: endDate }
  }, [selectedMonth])

  const tips = useMemo(() => {
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
  }, [data])

  const { data: cashflowData, isLoading } = useUcodeRequestQuery({
    method: 'find_operations',
    data: {
      ...tips,
      paymentConfirmed: true,
      paymentNotConfirmed: false,
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
  }, [cashflowData, data?.name])

  const operationsList = useMemo(() => {
    return {
      future: operationsDto(cashflowData?.data, 'future'),
      today: operationsDto(cashflowData?.data, 'today'),
      before: operationsDto(cashflowData?.data, 'before'),
    }
  }, [cashflowData])




  const isTransfer = data?.name === 'Зачисления' || data?.name === 'Списания' || data?.name === 'Перемещения'



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
