import { useMemo } from 'react'
import styles from './OperationCashFlowModal.module.scss'
import { useUcodeRequestQuery } from '../../../hooks/useDashboard'
import operationsDto from '../../../lib/dtos/operationsDto'
import IncomePaymentTableRow from './CashFlowTablesRows/IncomePaymentRow'
import { Loader2 } from 'lucide-react'
import { GlobalCurrency } from '../../../constants/globalCurrency'
import { formatAmount } from '../../../utils/helpers'
import { observer } from 'mobx-react-lite'

const OperationCashFlowModal = observer(({ 
  isOpen, 
  onClose, 
  filterData, 
  title, 
  summaryData, 
  isTransfer 
}) => {
  const { data: cashflowData, isLoading } = useUcodeRequestQuery({
    method: 'find_operations',
    data: filterData,
    querySetting: {
      enabled: !!filterData && !!isOpen,
      select: response => response?.data?.data,
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
    }
  })

  const operationsList = useMemo(() => {
    return {
      future: operationsDto(cashflowData?.data, 'future'),
      today: operationsDto(cashflowData?.data, 'today'),
      before: operationsDto(cashflowData?.data, 'before'),
    }
  }, [cashflowData])

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>
            {title || 'Операции'}
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
            <span className="">{summaryData?.periodLabel}</span>
          </div>
          <div className="flex text-sm items-center gap-10">
            <span className=" font-medium">Сумма операций</span>
            <div className="flex items-center gap-2">
              <span>{summaryData?.totalAmount !== undefined ? formatAmount(Number(summaryData.totalAmount).toFixed(2)) : '–'}</span>
              <span>{GlobalCurrency.name}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className=" overflow-auto h-[500px]">
          {isLoading ? (
            <div className='w-full h-full flex items-center justify-center'>
              <Loader2 className='animate-spin text-primary' size={30} />
            </div>
          ) : (
            <table className="w-full relative">
              <thead className="sticky top-0 z-10 h-10 bg-neutral-50 border-b box-content border-gray-300">
                <tr className='text-xs text-neutral-600 '>
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
                    {operationsList?.future?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={title} />)}

                    {operationsList?.today?.length > 0 && (
                      <tr className=" border-y border-y-gray-100 bg-neutral-50">
                        <td colSpan='5' className=" py-1 text-xs px-4">
                          <h3 className="">Сегодня</h3>
                        </td>
                      </tr>
                    )}
                    {operationsList?.today?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={title} />)}

                    {operationsList?.before?.length > 0 && (
                      <tr className=" border-y border-y-gray-100 bg-neutral-50">
                        <td colSpan='5' className=" py-1 text-xs px-4">
                          <h3 className="">До</h3>
                        </td>
                      </tr>
                    )}
                    {operationsList?.before?.map(op => <IncomePaymentTableRow key={op.id} op={op} tip={title} />)}
                  </>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 flex justify-end gap-3 border-t">
          <button onClick={onClose} className="primary-btn px-4! py-2!">
            Закрыть
          </button>
        </div>
      </div>
    </>
  )
})

export default OperationCashFlowModal
