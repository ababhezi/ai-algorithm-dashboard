import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DashboardModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}

export function DashboardModal({ title, subtitle, onClose, children }: DashboardModalProps) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-card__header">
          <div>
            <p className="modal-card__eyebrow">详细信息</p>
            <h3 className="modal-card__title">{title}</h3>
            {subtitle ? <p className="modal-card__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <div className="modal-card__body">{children}</div>
      </div>
    </div>
  );
}
