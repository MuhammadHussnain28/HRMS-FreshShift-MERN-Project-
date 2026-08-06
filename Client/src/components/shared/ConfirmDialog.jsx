import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Action',
  description = 'Are you sure you want to perform this action?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 z-10 overflow-hidden"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${isDanger ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-sky-50 text-sky-600 border border-sky-100'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl text-sm font-semibold shadow-sm ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
