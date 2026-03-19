'use client';

import Loader from '../../shared/Loader';
import styles from './DeleteDealModal.module.scss';

export function DeleteDealModal({ isOpen, onClose, onConfirm, deal, isDeleting = false }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <>
      <div 
        className={styles.deleteModalOverlay}
        onClick={onClose}
      />
      <div className={styles.deleteModal}>
        <div className={styles.deleteModalHeader}>
          <h3 className={styles.deleteModalTitle}>Подтверждение удаления</h3>
          <button 
            className={styles.deleteModalClose}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className={styles.deleteModalBody}>
          <p className={styles.deleteModalText}>
            Вы уверены, что хотите удалить сделку?
          </p>
          {deal && (
            <div className={styles.deleteModalInfo}>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Название:</span>
                <span className={styles.deleteModalInfoValue}>{deal.name || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Клиент:</span>
                <span className={styles.deleteModalInfoValue}>{deal.client || '—'}</span>
              </div>
              <div className={styles.deleteModalInfoItem}>
                <span className={styles.deleteModalInfoLabel}>Сумма:</span>
                <span className={styles.deleteModalInfoValue}>{deal.amount || '—'}</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.deleteModalFooter}>
          <button 
            className={styles.deleteModalButtonCancel}
            onClick={onClose}
          >
            Отмена
          </button>
          <button 
            className={styles.deleteModalButtonConfirm}
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader /> : 'Удалить'}
          </button>
        </div>
      </div>
    </>
  );
}
