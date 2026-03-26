import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomModal.module.scss';
import { IoCloseOutline } from 'react-icons/io5';
import { cn } from '@/app/lib/utils';

const CustomModal = ({ isOpen, onClose, children, className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={cn('bg-white p-5 rounded-lg relative', className)} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <IoCloseOutline size={24} color="#98A2B3" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;