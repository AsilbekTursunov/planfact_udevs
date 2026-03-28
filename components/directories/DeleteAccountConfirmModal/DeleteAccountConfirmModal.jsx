"use client"

import CustomModal from "../../shared/CustomModal"
import Loader from "../../shared/Loader"

export function DeleteAccountConfirmModal({ isOpen, account, onConfirm, onCancel, isDeleting = false }) {
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onCancel}
      className="w-[650px] p-2 overflow-hidden"
    >
      <div className="flex flex-col h-full bg-white text-slate-900">
        <div className="flex items-center justify-between p-3 ">
          <h3 className="text-lg font-semibold m-0">Подтверждение удаления</h3>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 m-0 mb-4">
            Вы действительно хотите удалить счет <strong>«{account.nazvanie || '—'}»</strong>?
          </p>
        </div>

        <div className="flex justify-end gap-3 p-3">
          <button
            className="px-5 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-md cursor-pointer hover:text-slate-900 hover:border-gray-300 hover:bg-gray-50 transition-all font-sans"
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border-none rounded-md cursor-pointer hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-sans"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader /> : 'Удалить'}
          </button>
        </div>
      </div>
    </CustomModal>
  )
}
