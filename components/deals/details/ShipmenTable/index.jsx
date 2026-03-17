import React, { useMemo, useState } from 'react'
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5'
import { MdOutlineModeEdit } from 'react-icons/md'
import { formatAmount } from '../../../../utils/helpers'
import CreateShipment from '../CreatingShipment'
import { useUcodeRequestMutation, useUcodeRequestQuery } from '../../../../hooks/useDashboard'
import { keepPreviousData } from '@tanstack/react-query'
import { shipmentsDto } from '../../../../lib/dtos/shipmentsDto'
import { Loader2 } from 'lucide-react'
import CustomModal from '../../../shared/CustomModal'
import { useQueryClient } from '@tanstack/react-query'

const ShipmenTable = ({ dealName = '', dealGuid = '' }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [shipmentToDelete, setShipmentToDelete] = useState(null)
  const queryClient = useQueryClient()

  console.log('shipmentToDelete', shipmentToDelete)

  const { data: shipments, isLoading } = useUcodeRequestQuery({
    method: "list_sales_operations",
    data: {
      object_data: {
        sales_transaction_id: dealGuid,
        tab: 'shipment',
        search: "",
        page: 1,
        limit: 20
      }
    },
    skip: !dealGuid,
    querySetting: {
      select: (response) => response?.data?.data?.data?.items,
      placeholderData: keepPreviousData,
    }
  })

  const { mutateAsync: deleteShipment, isPending: isDeleting } = useUcodeRequestMutation()

  const shipmentsList = useMemo(() => {
    return shipmentsDto(shipments)
  }, [shipments])

  const handleEditShipment = (shipment) => {
    setSelectedShipment(shipment)
    setIsEditing(true)
    setIsCopying(false)
    setShowModal(true)
  }

  const handleCopyShipment = (shipment) => {
    setSelectedShipment(shipment)
    setIsEditing(false)
    setIsCopying(true)
    setShowModal(true)
  }

  const handleDeleteShipment = (shipment) => { 
    setShipmentToDelete(shipment)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!shipmentToDelete) return;
    try {
      await deleteShipment({
        "method": "delete_shipment_transaction",
        "data": {
          "guid": shipmentToDelete.guid
        }
      })
      queryClient.invalidateQueries({ queryKey: ["list_sales_operations"] })
      queryClient.invalidateQueries({ queryKey: ["get_sales_transaction"] })
      setShowDeleteModal(false)
      setShipmentToDelete(null)
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  if (isLoading) {
    return <div className='flex items-center justify-center flex-1'>
      <Loader2 className='animate-spin text-primary' size={24} />
    </div>
  }


  return (
    <>
      <div className="h-96 overflow-y-auto min-w-[935px]">
        <table className="w-full">
          <thead className='sticky top-0 z-10'>
            <tr className='bg-neutral-100  text-neutral-800 font-light text-sm w-full border-b border-gray-200'>
              <th className='px-4 py-1 text-left w-[150px]'>Дата</th>
              <th className='px-4 py-1 text-left w-[150px]'>Юрлицо</th>
              <th className='px-4 py-1 text-left w-[150px]'>Контрагент</th>
              <th className='px-4 py-1 text-left w-[150px]'>Состав</th>
              <th className='px-4 py-1 text-left w-[150px]'>Статья</th>
              <th className='px-4 py-1 text-right w-[150px]'>Сумма</th>
            </tr>
          </thead>
          <tbody className='w-full'>
            {shipmentsList?.map((item) => {
              return (
                <tr key={item?.guid} className="bg-white hover:bg-gray-50 text-sm font-normal group text-neutral-900 cursor-pointer border-b group border-gray-200">
                  <td className="px-4 py-3 text-left">{item.operationDate}</td>
                  <td className="px-4 py-3 text-left">{item?.legal_entity_name || 'Юрлицо'}</td>
                  <td className="px-4 py-3 text-left">{item.counterparty}</td>
                  <td className="px-4 py-3 text-left">{item?.product_and_service_data?.[0]?.Naimenovanie || 'Товары/услуги'}</td>
                  <td className="px-4 py-3 text-left">{item?.my_account_name}</td>
                  <td className={`px-4 py-3  w-52 text-right`}>
                    <div className="flex items-center justify-end gap-4 h-6">
                      <p className={`font-base text-neutral-600`}>
                        {formatAmount(item.summa)} UZS
                      </p>
                      <div className=' items-center  hidden group-hover:flex '>
                        <button onClick={(e) => { e.stopPropagation(); handleEditShipment(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
                          <MdOutlineModeEdit size={16} className='text-gray-400' />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleCopyShipment(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
                          <IoCopyOutline size={16} className='text-gray-400' />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteShipment(item); }} className='text-neutral-600 size-6 hover:bg-gray-200 cursor-pointer flex items-center justify-center rounded-full hover:text-neutral-900'>
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
        <div className={`p-4 text-right font-semibold text-neutral-600`}>{formatAmount(shipmentsList?.reduce((acc, item) => acc + item.summa, 0))} UZS</div>
      </div>

      {showModal && (
        <CreateShipment
          open={showModal}
          onClose={() => setShowModal(false)}
          initialData={selectedShipment}
          isEditing={isEditing}
          isCopying={isCopying}
          dealName={dealName}
          dealGuid={dealGuid}
          kontragentId={selectedShipment?.counterparties_id}
        />
      )}

      {showDeleteModal && (
        <CustomModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
          <div className='p-2 flex flex-col'>
            <div className='flex justify-between items-center border-b border-gray-100 pb-2'>
              <h2 className='text-xl font-bold text-neutral-800'>Удалить отгрузку</h2>
            </div>

            <div className='py-6 text-base text-neutral-700'>
              Вы действительно хотите удалить отгрузку на сумму <span className='font-bold'>{formatAmount(shipmentToDelete?.summa)} UZS</span>? <br />
              Восстановить её будет невозможно.
            </div>

            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setShowDeleteModal(false)}
                className='px-4 py-2 text-sm text-primary hover:bg-gray-50 rounded-md font-semibold'
              >
                Отменить
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className='px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md flex items-center justify-center min-w-[100px]'
              >
                {isDeleting ? <Loader2 className='animate-spin h-4 w-4' /> : 'Удалить'}
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </>
  )
}

export default ShipmenTable