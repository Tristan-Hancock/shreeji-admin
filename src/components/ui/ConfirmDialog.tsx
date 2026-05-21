import { useState } from 'react';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';
import Modal from './Modal';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    button: 'bg-red-600 hover:bg-red-700 shadow-red-100',
  },
  warning: {
    icon: Archive,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
  },
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const config = variantConfig[variant];
  const Icon = config.icon;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={cn('p-3 rounded-2xl mb-4', config.iconBg)}>
          <Icon className={cn('w-7 h-7', config.iconColor)} />
        </div>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6 max-w-xs">
          {description}
        </p>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-neutral-600 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg transition-colors disabled:opacity-60',
              config.button,
            )}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
