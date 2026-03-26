"use client"

import styles from './OperationsTable.module.scss'
import Loader from '../../shared/Loader'

export function DeleteConfirmModal({ isOpen, operation, onConfirm, onCancel, isDeleting = false }) {
  if (!isOpen) return null

  return (
    <>
      <div
        className={styles.deleteModalOverlay}
        onClick={onCancel}
      />
      <div className={styles.deleteModal}>
        <div className={styles.deleteModalHeader}>
          <h3 className={styles.deleteModalTitle}>Подтверждение удаления</h3>
          <button
            className={styles.deleteModalClose}
            onClick={onCancel}
          >
            ✕
          </button>
        </div>
        <div className={styles.deleteModalBody}>
          <p className={styles.deleteModalText}>
            Вы уверены, что хотите удалить операцию?
          </p>
          {operation && (
            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Описание:</span>
                <span className={styles.deleteModalInfoValue}>{operation.opisanie || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Сумма:</span>
                <span className={styles.deleteModalInfoValue}>{operation.summa || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Дата:</span>
                <span className={styles.deleteModalInfoValue}>{operation.operationDate || '—'}</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.deleteModalFooter}>
          <button
            className={styles.deleteModalButtonCancel}
            onClick={onCancel}
          >
            Отмена
          </button>
          <button
            className={styles.deleteModalButtonConfirm}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader /> : 'Удалить'}
          </button>
        </div>
      </div>
    </>
  )
}
