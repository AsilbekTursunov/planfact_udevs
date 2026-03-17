'use client'
import { formatAmount } from '@/utils/helpers'
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5'
import { MdOutlineModeEdit } from 'react-icons/md'
import { useMemo, useState } from 'react'
import OperationModal from '@/components/operations/OperationModal/OperationModal'
import { keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import operationsDto from '../../../../lib/dtos/operationsDto'
import { ReceiptsEmptyIcon } from '../../../../constants/icons'
import { Loader2 } from 'lucide-react'

/* ─── Main table component ────────────────────────────────── */
const ExpenseOperationsTable = ({ sellingDealId }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState(null)
  const [modalType, setModalType] = useState('income')
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isModalOpening, setIsModalOpening] = useState(false)
  const queryClient = useQueryClient()

  const { data: operations, isLoading } = useUcodeRequestQuery({
    method: "find_operations",
    data: {
      selling_deal_ids: [sellingDealId],
      tip: ['Выплата'],
    },
    querySetting: {
      select: (response) => response?.data?.data?.data,
      placeholderData: keepPreviousData,
    }
  })

  const dealOperations = useMemo(() => {
    return operationsDto(operations)
  }, [operations])


  if (dealOperations?.length === 0) return null

  const handleEditOperation = (operation) => {
    setSelectedOperation(operation)
    setModalType('payment')
    setShowModal(true)
    setIsModalClosing(false)
    setIsModalOpening(true)
    setTimeout(() => setIsModalOpening(false), 50)
  }

  const handleCopyOperation = (operation) => {
    const copiedOperation = { ...operation }
    delete copiedOperation.guid
    delete copiedOperation.id
    if (copiedOperation.rawData) {
      copiedOperation.rawData = { ...copiedOperation.rawData }
      delete copiedOperation.rawData.guid
    }

    setSelectedOperation({
      ...copiedOperation,
      id: 'new',
      isNew: true,
      isCopy: true
    })
    setModalType('payment')
    setShowModal(true)
    setIsModalClosing(false)
    setIsModalOpening(true)
    setTimeout(() => setIsModalOpening(false), 50)
  }

  const handleDeleteOperation = (operation) => {
    console.log('handleDeleteOperation', operation)
  }

  if (isLoading) {
    return <div className='flex items-center justify-center flex-1'>
      <Loader2 className='animate-spin text-primary' size={24} />
    </div>
  }

  return (
    <>
      {dealOperations?.length === 0 && <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <ReceiptsEmptyIcon />
        </div>
        <div className={styles.emptyStateTitle}>Добавьте поступления по сделке</div>
        <div className={styles.emptyStateSubtext}>Учитывайте поступления клиента, чтобы контролировать выполнение обязательств по сделке</div>
        <button className="primary-btn" onClick={handleCreateOperation}>
          Добавить
        </button>
      </div>
      }
      {dealOperations?.length > 0 && <>
        <div className="h-96 overflow-y-auto">
          <table className="w-full">
            <thead className='sticky top-0 z-10'>
              <tr className='bg-neutral-100 text-neutral-600 font-normal text-sm w-full border-b border-gray-200'>
                <th className='p-4 text-left w-[150px]'>Дата</th>
                <th className='p-4 text-left w-[150px]'>Счет</th>
                <th className='p-4 text-left w-[150px]'>Контрагент</th>
                <th className='p-4 text-left w-[150px]'>Статья</th>
                <th className='p-4 text-right w-[150px]'>Сумма</th>
              </tr>
            </thead>
            <tbody className='w-full'>
              {dealOperations?.map((item) => {
                return (
                  <tr key={item?.guid} className="bg-white hover:bg-gray-50 text-sm font-normal group text-neutral-900 cursor-pointer border-b group border-gray-200">
                    <td className="p-3 text-left">{item.operationDate}</td>
                    <td className="p-3 text-left">{item.my_account_name}</td>
                    <td className="p-3 text-left">{item.counterparty}</td>
                    <td className="p-3 text-left">{item.chartOfAccounts}</td>
                    <td className={`p-3 text-right`}>
                      <div className="flex items-center justify-end gap-4 h-6">
                        <p className={`font-base text-red-600`}>
                          {'-'}{formatAmount(item.summa)} UZS
                        </p>
                        <div className=' items-center  hidden group-hover:flex '>
                          <button onClick={(e) => { e.stopPropagation(); handleEditOperation(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
                            <MdOutlineModeEdit size={16} className='text-gray-400' />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleCopyOperation(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
                            <IoCopyOutline size={16} className='text-gray-400' />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteOperation(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
                            <IoCloseOutline size={16} className='text-gray-400' />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className='flex justify-end'>
          <div className="p-4 text-right text-neutral-700 font-semibold">Итого:</div>
          <div className={`p-4 text-right font-semibold text-red-600`}>{'-'}{formatAmount(dealOperations?.reduce((acc, item) => acc + item.summa, 0))} UZS</div>
        </div>
      </>}

      {showModal && (
        <OperationModal
          operation={selectedOperation}
          isClosing={isModalClosing}
          isOpening={isModalOpening}
          defaultDealGuid={data?.[0]?.selling_deal_id}
          onClose={() => {
            setIsModalClosing(true)
            setTimeout(() => {
              setShowModal(false)
              setIsModalClosing(false)
            }, 300)
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] })
            setShowModal(false)
          }}
          initialTab={modalType}
        />
      )}
    </>
  )
}

export default ExpenseOperationsTable
