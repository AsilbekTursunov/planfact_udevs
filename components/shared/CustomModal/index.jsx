import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/app/lib/utils';
import { X } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, children, className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/20 backdrop-blur-xs" onClick={onClose}>
      <div className={cn('bg-white p-5 rounded-lg relative', className)} onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="absolute top-4! right-4! z-10000 cursor-pointer" onClick={onClose}>
          <X size={24} color="#98A2B3" />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;