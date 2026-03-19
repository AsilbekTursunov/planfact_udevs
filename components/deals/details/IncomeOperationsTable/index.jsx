'use client'
import { formatAmount } from '@/utils/helpers'
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5'
import { MdOutlineModeEdit } from 'react-icons/md'
import { useMemo, useState } from 'react'
import OperationModal from '@/components/operations/OperationModal/OperationModal'
import { keepPreviousData, useQueryClient } from '@tanstack/react-query'
import { useUcodeRequestQuery, useDeleteOperation } from '../../../../hooks/useDashboard'
import CustomModal from '../../../shared/CustomModal'
import operationsDto from '../../../../lib/dtos/operationsDto'
import { ReceiptsEmptyIcon } from '../../../../constants/icons'
import { Loader2 } from 'lucide-react'


import EmptyState from '../EmptyState'

/* ─── Main table component ────────────────────────────────── */
const IncomeOperationsTable = ({ sellingDealId, onAdd }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState(null)
  const [modalType, setModalType] = useState('income')
  const [isModalClosing, setIsModalClosing] = useState(false)
  const [isModalOpening, setIsModalOpening] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [operationToDelete, setOperationToDelete] = useState(null)
  const deleteOperationMutation = useDeleteOperation()
  const queryClient = useQueryClient()

  const { data: operations, isLoading } = useUcodeRequestQuery({
    method: "find_operations",
    data: {
      selling_deal_ids: sellingDealId,
      tip: ['Поступление'],
    },
    querySetting: {
      select: (response) => response?.data?.data?.data,
      placeholderData: keepPreviousData,
    }
  })

  const dealOperations = useMemo(() => {
    return operationsDto(operations)
  }, [operations])


  if (dealOperations?.length === 0) {
    return (
      <EmptyState 
        title="Добавьте поступления по сделке" 
        subtitle="Учитывайте поступления клиента, чтобы контролировать выполнение обязательств по сделке" 
        onAdd={onAdd}
      />
    )
  }

  const handleEditOperation = (operation) => {
    setSelectedOperation(operation)
    setModalType('income')
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
    setModalType('income')
    setShowModal(true)
    setIsModalClosing(false)
    setIsModalOpening(true)
    setTimeout(() => setIsModalOpening(false), 50)
  }

  const handleDeleteOperation = (operation) => {
    setOperationToDelete(operation)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!operationToDelete) return
    const guid = operationToDelete.rawData?.guid || operationToDelete.guid
    if (!guid) return

    try {
      await deleteOperationMutation.mutateAsync([guid])
      setIsDeleteModalOpen(false)
      setOperationToDelete(null)
      queryClient.invalidateQueries({ queryKey: ['get_sales_transaction_by_guid'] })
    } catch (error) {
      console.error('Error deleting operation:', error)
    }
  }


  if (isLoading) {
    return <div className='flex items-center justify-center flex-1'>
      <Loader2 className='animate-spin text-primary' size={24} />
    </div>
  }

  return (
    <>
      {/* emptyState div is moved to top EmptyState component */}
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
                        <p className={`font-base text-green-600`}>
                          {'+'}{formatAmount(item.summa)} UZS
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
          <div className={`p-4 text-right font-semibold text-green-600`}>{'+'}{formatAmount(dealOperations?.reduce((acc, item) => acc + item.summa, 0))} UZS</div>
        </div>
      </>}

      {showModal && (
        <OperationModal
          operation={selectedOperation}
          isClosing={isModalClosing}
          isOpening={isModalOpening}
          defaultDealGuid={sellingDealId}
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

      {isDeleteModalOpen && (
        <CustomModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div className='p-6 flex flex-col'>
            <div className='flex justify-between items-center border-b border-gray-100 pb-4'>
              <h2 className='text-xl font-bold text-neutral-800'>Удалить операцию</h2>
            </div>

            <div className='py-6 text-base text-neutral-700'>
              Вы действительно хотите удалить операцию на сумму <span className='font-bold'>{formatAmount(operationToDelete?.summa)} UZS</span>? <br />
              Восстановить её будет невозможно.
            </div>

            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className='px-4 py-2 text-sm text-primary hover:bg-gray-50 rounded-md font-semibold'
              >
                Отменить
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteOperationMutation.isPending}
                className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md flex items-center justify-center min-w-[100px]'
              >
                {deleteOperationMutation.isPending ? <Loader2 className='animate-spin h-4 w-4' /> : 'Удалить'}
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  )
}

export default IncomeOperationsTable
