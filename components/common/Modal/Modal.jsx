import { useEffect } from 'react';
import styles from './Modal.module.scss';

const Modal = ({ open, onClose, children, className = '' }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`${styles.modalBackdrop} ${className}`} onClick={handleBackdropClick}>
      {children}
    </div>
  );
};

export default Modal;