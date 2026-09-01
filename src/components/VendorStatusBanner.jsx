import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Info, 
  RefreshCw, 
  Settings, 
  PhoneCall, 
  Mail, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Store,
  X
} from 'lucide-react';

export default function VendorStatusBanner({ vendorId, token, onNavigateSettings, onRefreshStatus, activeVendor }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);
  const [isApprovedBannerDismissed, setIsApprovedBannerDismissed] = useState(false);

  const vendorKey = vendorId || activeVendor?.vendor_id || 'default';

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getVendorStatus(vendorId, token);
      setStatusData(data);
    } catch (err) {
      console.warn('Failed to fetch vendor status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [vendorId, token]);

  // Mark the approval banner as seen so it only displays once
  useEffect(() => {
    if (statusData?.is_accepted) {
      const storageKey = `digilocal_vendor_approved_banner_seen_${vendorKey}`;
      const seen = localStorage.getItem(storageKey);
      if (!seen) {
        // Will show this first time, and persist key so it won't show on subsequent visits/reloads
        localStorage.setItem(storageKey, 'true');
      }
    }
  }, [statusData, vendorKey]);

  const handleDismissApprovedBanner = () => {
    try {
      localStorage.setItem(`digilocal_vendor_approved_banner_seen_${vendorKey}`, 'true');
    } catch (_) {}
    setIsApprovedBannerDismissed(true);
  };

  const handleResubmit = async () => {
    try {
      setResubmitting(true);
      const payload = {
        vendor_id: vendorId || activeVendor?.vendor_id || 1164,
        store_name: activeVendor?.store_name || activeVendor?.shop_business_name || 'My Local Store',
        vendor_name: activeVendor?.vendor_name || activeVendor?.owner_name || 'Vendor Merchant',
        gstin: activeVendor?.gstin || activeVendor?.gst_number || '',
        area: activeVendor?.area || activeVendor?.location || '',
        city: activeVendor?.city || 'Jaipur',
        pincode: activeVendor?.pincode || '302020',
        shop_image: activeVendor?.logo || activeVendor?.shop_image || ''
      };

      const res = await api.resubmitVendorApplication(payload, token);
      if (res && res.has_resubmitted) {
        setResubmitSuccess(true);
        fetchStatus();
        if (onRefreshStatus) onRefreshStatus();
      }
    } catch (err) {
      console.error('Failed to resubmit application:', err);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 rounded-full bg-gray-300"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!statusData) return null;

  const {
    status,
    is_accepted,
    is_pending,
    is_rejected,
    is_on_hold,
    has_resubmitted,
    hold_reason,
    recommended_ui_text
  } = statusData;

  // 1. ACCEPTED STATUS (Green Banner) - Show ONLY ONCE right after approval, then never show again!
  if (is_accepted) {
    const hasSeenApprovedBanner = localStorage.getItem(`digilocal_vendor_approved_banner_seen_${vendorKey}`);
    
    // If already dismissed in current session, or was previously shown in a past visit, do not show!
    if (isApprovedBannerDismissed || hasSeenApprovedBanner === 'true') {
      return null;
    }

    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              Store Active & Verified
            </h4>
            <p className="text-xs font-medium text-emerald-800 mt-0.5">
              {recommended_ui_text || "Congratulations! Your shop application is approved and active."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismissApprovedBanner}
          className="p-1.5 rounded-full hover:bg-emerald-100/80 text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 2. ON HOLD STATUS (Orange Banner when not resubmitted, Blue Info when resubmitted)
  if (is_on_hold) {
    const isResubmittedState = has_resubmitted || resubmitSuccess;

    if (isResubmittedState) {
      return (
        <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 text-blue-950 space-y-3 shadow-sm animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-serif font-bold text-blue-950">
                    Resubmitted — Under Review
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                    ✔ Updates Resubmitted
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-800 mt-0.5">
                  {recommended_ui_text || "Your resubmitted application is currently under review by admin in the Hold section."}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ON HOLD - ACTION REQUIRED (Orange/Amber Banner)
    return (
      <div className="p-5 rounded-3xl bg-orange-50 border border-orange-200 text-orange-950 space-y-3.5 shadow-sm animate-in fade-in">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-orange-950">
                Action Required: Application On Hold
              </h4>
              <p className="text-xs font-semibold text-orange-900 mt-0.5">
                {recommended_ui_text || "Your application is on hold. Please update your details as requested in the reason below and click Resubmit Request."}
              </p>
            </div>
          </div>
        </div>

        {hold_reason && (
          <div className="p-3.5 rounded-2xl bg-white border border-orange-200/80 text-xs font-medium space-y-1">
            <span className="font-bold text-orange-950 block">Admin Note / Reason:</span>
            <p className="text-orange-900 leading-relaxed font-semibold">{hold_reason}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-1">
          {onNavigateSettings && (
            <button
              type="button"
              onClick={onNavigateSettings}
              className="px-4 py-2 rounded-xl bg-white hover:bg-orange-100/60 border border-orange-300 text-orange-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-orange-800" />
              <span>Edit Store Settings</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResubmit}
            disabled={resubmitting}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resubmitting ? 'animate-spin' : ''}`} />
            <span>{resubmitting ? 'Resubmitting...' : 'Resubmit Request'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. REJECTED STATUS (Red Banner / Access Denied)
  if (is_rejected) {
    return (
      <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 space-y-3.5 shadow-sm animate-in fade-in">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <XCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="text-sm font-serif font-bold text-rose-950">
              Application Rejected
            </h4>
            <p className="text-xs font-semibold text-rose-900 mt-0.5">
              {recommended_ui_text || "Your application was rejected by admin. Please contact support if you believe this is an error."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-1 border-t border-rose-200/80">
          <a
            href="tel:+919876543210"
            className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
            <span>Call Support</span>
          </a>

          <a
            href="mailto:support@digilocal.in"
            className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Mail className="w-3.5 h-3.5 text-rose-700" />
            <span>Email Support</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. PENDING STATUS (Yellow Banner / Under Review)
  return (
    <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3 shadow-sm animate-in fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Clock className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h4 className="text-sm font-serif font-bold text-amber-950">
            Application Under Review
          </h4>
          <p className="text-xs font-semibold text-amber-900 mt-0.5">
            {recommended_ui_text || "Your registration request is under review by admin. Verification will be completed soon."}
          </p>
        </div>
      </div>
    </div>
  );
}
