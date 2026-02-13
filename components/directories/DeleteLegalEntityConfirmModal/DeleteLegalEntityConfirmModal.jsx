"use client"

import { cn } from '@/app/lib/utils'
import styles from './DeleteLegalEntityConfirmModal.module.scss'

export default function DeleteLegalEntityConfirmModal({ isOpen, legalEntity, onConfirm, onCancel, isDeleting }) {
  if (!isOpen) return null

  return (
    <>
      <div 
        className={cn(styles.overlay, styles.opening)}
        onClick={onCancel}
      />
      <div 
        className={cn(styles.modal, styles.opening)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 id="modal-title" className={styles.title}>Удаление юрлица</h3>
          <button 
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Закрыть"
            disabled={isDeleting}
          >
            <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.body}>
          <p className={styles.text}>
            Вы уверены, что хотите удалить юрлицо <strong>{legalEntity?.nazvanie || 'Без названия'}</strong>?
          </p>
          <p className={styles.warning}>
            Это действие нельзя отменить.
          </p>
        </div>
        <div className={styles.footer}>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Отменить
          </button>
          <button 
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      </div>
    </>
  )
}
