import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

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
  useScrollLock(isOpen);

  if (!isOpen) return null;

  const isConfirm = type === 'confirm';

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0
      }}
      onClick={onCancel || onConfirm}
    >
      <div 
        className="relative bg-white border border-[#E7DFD5] rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl text-center flex flex-col items-center max-h-[85vh] overflow-hidden text-[#211A19] animate-in zoom-in-95 duration-150"
        style={{ margin: 'auto', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Icon Header */}
        <div className="mb-3.5 shrink-0">
          {type === 'success' && (
            <div className="w-13 h-13 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-sm mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          )}
          {type === 'error' && (
            <div className="w-13 h-13 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-sm mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
          )}
          {(type === 'warning' || type === 'confirm') && (
            <div className="w-13 h-13 rounded-full bg-[#541D26]/10 border border-[#541D26]/20 text-[#541D26] flex items-center justify-center shadow-sm mx-auto">
              <AlertTriangle className="w-7 h-7 text-[#541D26]" />
            </div>
          )}
          {type === 'info' && (
            <div className="w-13 h-13 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm mx-auto">
              <Info className="w-7 h-7" />
            </div>
          )}
        </div>

        {/* Title & Message */}
        <h3 className="text-base font-serif font-extrabold text-[#211A19] uppercase tracking-wide mb-1.5 shrink-0">
          {title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice')}
        </h3>

        <div className="overflow-y-auto max-h-[45vh] w-full mb-5 px-1 scrollbar-thin">
          <p className="text-xs text-[#78716C] leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-2 shrink-0">
          {isConfirm ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-[#FAF8F5] border border-[#E7DFD5] text-[#211A19] hover:bg-[#EEE5DA] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-colors border border-[#C8A878]/30 cursor-pointer"
              >
                {confirmText}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConfirm || onCancel}
              className="w-full py-3.5 rounded-xl bg-[#541D26] hover:bg-[#6B2732] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all border border-[#C8A878]/30 cursor-pointer"
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
