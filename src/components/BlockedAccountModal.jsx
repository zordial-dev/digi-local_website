import React from 'react';
import { createPortal } from 'react-dom';
import { AlertOctagon, Phone, MessageSquare, ShieldAlert, X, HelpCircle, ExternalLink } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function BlockedAccountModal({ isOpen = true, onClose, onOpenSupport, blockInfo }) {
  useScrollLock(isOpen);
  if (!isOpen) return null;

  const title = blockInfo?.title || 'Account Blocked by Admin';
  const message = blockInfo?.message || blockInfo?.error || 'Your account has been blocked by the platform administrator. Access to DigiLocal services is restricted.';
  const code = blockInfo?.code || 'ACCOUNT_BLOCKED';
  const reason = blockInfo?.blockReason || blockInfo?.block_reason || blockInfo?.hold_reason || 'Violation of community policies or safety standards';
  const accountType = blockInfo?.accountType === 'vendor' ? 'Vendor Store' : 'Resident User';

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden font-sans"
      onClick={onClose}
    >
      <div 
        className="bg-[#211A19] text-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-rose-500/30 space-y-5 font-sans relative animate-in zoom-in-95 duration-200 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Subtle red emergency glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider border border-rose-500/30">
                {code}
              </span>
              <h3 className="text-lg font-serif font-bold text-white mt-0.5">{title}</h3>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Message */}
        <p className="text-xs text-white/80 font-medium leading-relaxed">
          {message}
        </p>

        {/* Reason Box / Strikes List */}
        {Array.isArray(blockInfo?.strike_reasons_list) && blockInfo.strike_reasons_list.length > 0 ? (
          <div className="p-4 bg-rose-950/40 border border-rose-500/25 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                {blockInfo.is_auto_banned || blockInfo.strikes >= 3 ? '⚡ 3-Strike Auto-Ban Record' : 'Official Strike Reasons:'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {blockInfo.strikes || blockInfo.strike_reasons_list.length}/3 Strikes
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {(blockInfo.strike_reasons || blockInfo.strike_reasons_list).map((st, i) => {
                const strikeNumber = typeof st === 'object' ? (st.strike_number || i + 1) : i + 1;
                const reasonText = typeof st === 'object' ? (st.reason || '') : st;
                const dateText = typeof st === 'object' && st.created_at ? new Date(st.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;

                return (
                  <div key={i} className="p-2 rounded-xl bg-black/40 border border-rose-500/20 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between text-rose-400 font-extrabold text-[10px] uppercase">
                      <span>Strike #{strikeNumber}</span>
                      {dateText && <span className="text-white/40">{dateText}</span>}
                    </div>
                    <p className="text-white/95 font-medium leading-tight">
                      {reasonText}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-[#D6B7A5] pt-0.5">
              Account Type: <strong className="text-white">{accountType}</strong>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-rose-950/40 border border-rose-500/25 rounded-2xl space-y-1.5 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
              Official Block Notice & Reason:
            </span>
            <p className="font-semibold text-white/95">
              "{reason}"
            </p>
            <p className="text-[11px] text-[#D6B7A5] pt-1">
              Account Type: <strong className="text-white">{accountType}</strong>
            </p>
          </div>
        )}

        {/* Support Instructions */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => {
              if (onClose) onClose();
              if (onOpenSupport) onOpenSupport();
            }}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Customer Support Desk</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Acknowledge & Close
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
