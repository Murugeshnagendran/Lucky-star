'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  isLoading = false
}) => {
  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger': return 'danger';
      case 'warning': return 'primary'; // Fallback to primary if warning not defined on Button
      case 'primary': return 'primary';
      default: return 'primary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="mt-2">
        <p className="text-sm text-neutral-500">
          {message}
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button 
          variant={getConfirmButtonVariant()} 
          onClick={onConfirm} 
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};
