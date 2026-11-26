import { LoaderCircle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  title,
  message,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-md rounded-md border border-slate-200 bg-white"
      >
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 id="confirm-dialog-title" className="text-base font-semibold text-slate-800">
            {title}
          </h2>
        </div>
        <p id="confirm-dialog-description" className="p-4 text-sm text-slate-700">
          {message}
        </p>
        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-red-600 px-3 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
            {isLoading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;
