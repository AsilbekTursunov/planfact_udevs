import React from 'react'
import CustomModal from '@/components/shared/CustomModal'
import Loader from '@/components/shared/Loader'

const DeleteAccountGroupModal = ({ isOpen, onClose, onConfirm, groupName, isDeleting }) => {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      // width="450px"
    >
      <div className="p-3">
        <h2 className="text-xl font-semibold mb-4 text-slate-900 text-start">Удалить группу</h2>
        
        <div className="text-slate-600 mb-8 text-start leading-relaxed">
          Вы уверены, что хотите удалить группу <span className="font-bold text-slate-900">{groupName}</span>?
          <br />
          Данная группа содержит счета, которые будут перемещены в группу «Нераспределенные».
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#0e73f6] cursor-pointer font-medium hover:bg-slate-50 transition-colors rounded"
            disabled={isDeleting}
          >
            Отменить
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#f43f5e] cursor-pointer hover:bg-[#e11d48] text-white font-medium transition-colors rounded min-w-[100px] flex items-center justify-center"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader className="w-5 h-5 border-white" /> : 'Удалить'}
          </button>
        </div>
      </div>
    </CustomModal>
  )
}

export default DeleteAccountGroupModal
