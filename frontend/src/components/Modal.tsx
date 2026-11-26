import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  isBusy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

function Modal({ title, isBusy = false, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-md border border-slate-200 bg-white"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h2 id="admin-modal-title" className="text-base font-semibold text-slate-800">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            aria-label="Đóng"
            className="flex h-11 w-11 items-center justify-center rounded-md text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default Modal;
