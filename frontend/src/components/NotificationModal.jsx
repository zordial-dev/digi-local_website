import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationModal({
  isOpen,
  title,
  message,
  type = 'info', // 'success' | 'error' | 'warning' | 'info' | 'confirm'
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}) {
  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1428]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-[#C5A880]/30 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center">
        
        {/* Icon Header */}
        <div className="mb-4">
          {type === 'success' && (
            <div className="w-14 h-14 rounded-full bg-[#E8F5E9] border border-[#2E7D32]/30 text-[#2E7D32] flex items-center justify-center shadow-sm mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
          {(type === 'warning' || type === 'confirm') && (
            <div className="w-14 h-14 rounded-full bg-[#F6F3EC] border border-[#C5A880]/40 text-[#C5A880] flex items-center justify-center shadow-sm mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
          )}
          {type === 'info' && (
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm mx-auto">
              <Info className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-serif font-extrabold text-[#0A1428] uppercase tracking-wide mb-1">
          {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}
        </h3>

        <p className="text-xs text-[#787F8C] leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Buttons */}
        <div className="w-full space-y-2">
          {isConfirm ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl bg-transparent border border-[#C5A880]/40 text-[#787F8C] hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider shadow-sm transition-colors"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onConfirm || onCancel}
              className="w-full py-3 rounded-xl bg-[#0A1428] hover:bg-[#C5A880] text-white hover:text-[#0A1428] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
            >
              {confirmText}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
