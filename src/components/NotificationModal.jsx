import React from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onCancel || onConfirm}
    >
      <div 
        className="bg-white border border-[#E7DFD5] rounded-[2rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center my-auto animate-in zoom-in-95 duration-200 text-[#211A19]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Icon Header */}
        <div className="mb-4">
          {type === 'success' && (
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
          {(type === 'warning' || type === 'confirm') && (
            <div className="w-14 h-14 rounded-full bg-[#541D26]/10 border border-[#541D26]/20 text-[#541D26] flex items-center justify-center shadow-sm mx-auto">
              <AlertTriangle className="w-8 h-8 text-[#541D26]" />
            </div>
          )}
          {type === 'info' && (
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm mx-auto">
              <Info className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-serif font-extrabold text-[#211A19] uppercase tracking-wide mb-1">
          {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}
        </h3>

        <p className="text-xs text-[#78716C] leading-relaxed mb-6 font-medium">
          {message}
        </p>

        {/* Buttons */}
        <div className="w-full space-y-2">
          {isConfirm ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl bg-[#FAF8F5] border border-[#E7DFD5] text-[#211A19] hover:bg-[#EEE5DA] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors border border-[#C8A878]/30 cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              onClick={onConfirm || onCancel}
              className="w-full py-3.5 rounded-2xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all border border-[#C8A878]/30 cursor-pointer"
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
