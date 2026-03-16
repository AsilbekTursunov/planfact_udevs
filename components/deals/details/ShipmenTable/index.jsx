import React, { useState } from 'react'
import { IoCloseOutline, IoCopyOutline } from 'react-icons/io5'
import { MdOutlineModeEdit } from 'react-icons/md'
import { formatAmount } from '../../../../utils/helpers'
import CreateShipment from '../CreatingShipment'

const ShipmenTable = ({ data = [], dealName = '', dealGuid = '' }) => {
  const [showModal, setShowModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCopying, setIsCopying] = useState(false)

  if (data.length === 0) return null

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
    console.log('handleDeleteShipment', shipment)
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
            {data?.map((item) => {
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
        <div className={`p-4 text-right font-semibold text-neutral-600`}>{formatAmount(data?.reduce((acc, item) => acc + item.summa, 0))} UZS</div>
      </div>

      {showModal && (
        <CreateShipment
          open={showModal}
          onClose={() => setShowModal(false)}
          initialData={selectedShipment}
          isEditing={isEditing}
          isCopying={isCopying}
          dealName={dealName || selectedShipment?.sales_id || data?.[0]?.sales_id}
          dealGuid={dealGuid || selectedShipment?.sales_id || data?.[0]?.sales_id}
          kontragentId={selectedShipment?.partners_id || data?.[0]?.partners_id}
        />
      )}
    </>
  )
}

export default ShipmenTable