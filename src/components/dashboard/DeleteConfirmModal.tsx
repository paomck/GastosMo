'use client';
import styles from './DeleteConfirmModal.module.css';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  merchant: string;
  amount: number;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, merchant, amount }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.warningIcon}>
            <AlertTriangle size={24} />
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <h3 className={styles.title}>Delete Transaction?</h3>
        <p className={styles.text}>
          Are you sure you want to delete the transaction for <strong>{merchant}</strong> (₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })})? This action cannot be undone.
        </p>

        <div className={styles.actions}>
          <button 
            className={styles.deleteBtn} 
            onClick={() => { onConfirm(); onClose(); }}
          >
            Delete
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
