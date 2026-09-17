import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, ShieldAlert, X, HelpCircle, AlertCircle, Clock, CheckCircle2, ChevronRight, Flame } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function UserStrikeWarningModal({ isOpen = true, onClose, onOpenSupport, strikeInfo }) {
  useScrollLock(isOpen);
  if (!isOpen) return null;

  const strikes = Number(strikeInfo?.strikes || 2);
  const maxStrikes = Number(strikeInfo?.max_strikes_allowed || 3);
  const title = strikeInfo?.warning_title || (strikes === 2 ? '⚡ Second Strike Warning' : `⚡ Account Strike Notice (${strikes}/${maxStrikes})`);
  const message = strikeInfo?.warning_message || 'Warning: You have received 2 strikes on your account due to policy violations. Receiving a 3rd strike will result in your account being automatically blocked!';
  
  const reasonsList = Array.isArray(strikeInfo?.strike_reasons_list) && strikeInfo.strike_reasons_list.length > 0
    ? strikeInfo.strike_reasons_list
    : (Array.isArray(strikeInfo?.strike_reasons) ? strikeInfo.strike_reasons.map(s => typeof s === 'string' ? s : s.reason) : []);

  const strikeDetails = Array.isArray(strikeInfo?.strike_reasons) && strikeInfo.strike_reasons.length > 0
    ? strikeInfo.strike_reasons
    : reasonsList.map((r, i) => ({
        strike_number: i + 1,
        reason: r,
        created_at: null
      }));

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {
      return null;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md font-sans animate-in fade-in duration-200 overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="bg-[#1C1514] text-white rounded-3xl max-w-lg w-full max-h-[90vh] p-5 sm:p-7 shadow-2xl border border-amber-500/40 space-y-4 sm:space-y-5 font-sans relative overflow-y-auto pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Amber Emergency Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Strike {strikes} of {maxStrikes} Warning</span>
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-black text-white mt-1 leading-tight">
                {title}
              </h3>
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

        {/* Main Urgent Warning Banner */}
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl relative z-10 space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Policy Violation Moderation Notice</span>
          </div>
          <p className="text-xs text-amber-100/90 font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Strike Breakdown List */}
        <div className="space-y-2 relative z-10">
          <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground text-[#D6B7A5] flex items-center justify-between">
            <span>Recorded Strikes & Policy Violations</span>
            <span className="text-amber-400 font-extrabold">{strikeDetails.length} Violation{strikeDetails.length === 1 ? '' : 's'}</span>
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {strikeDetails.map((item, idx) => {
              const strikeNum = item.strike_number || idx + 1;
              const isSecond = strikeNum === 2;
              const formattedDate = formatDate(item.created_at);

              return (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                    isSecond 
                      ? 'bg-rose-950/30 border-rose-500/40 text-rose-100' 
                      : 'bg-white/5 border-white/10 text-white/90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isSecond 
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      Strike #{strikeNum}
                    </span>
                    {formattedDate && (
                      <span className="text-[10px] text-white/50 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        <span>{formattedDate}</span>
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-white/95 text-[11.5px] pt-0.5">
                    {item.reason || `Strike violation #${strikeNum}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3rd Strike Consequence Callout */}
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs relative z-10">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 font-black text-sm">
            !
          </div>
          <div className="text-[11px] text-rose-200/90 leading-tight">
            <strong className="text-white block font-bold">1 strike remaining before automatic account ban:</strong>
            Receiving a 3rd strike will immediately suspend your resident account and revoke ordering access.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 relative z-10">
          <button
            onClick={() => {
              if (onClose) onClose();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-[#541D26] hover:from-amber-500 hover:to-[#6B2430] text-white rounded-full font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I Understand & Acknowledge Warning</span>
          </button>

          {onOpenSupport && (
            <button
              onClick={() => {
                if (onClose) onClose();
                onOpenSupport();
              }}
              className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Appeal or Contact Support</span>
            </button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
