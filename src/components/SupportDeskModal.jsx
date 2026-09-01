import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  X, 
  ChevronRight, 
  User, 
  Store, 
  HelpCircle,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function SupportDeskModal({ isOpen, onClose, userType = 'user', initialEmail = '', initialName = '', entityName = '' }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  
  // Ticket Form State
  const [ticketUserType, setTicketUserType] = useState(userType);
  const [source, setSource] = useState(userType === 'vendor' ? 'vendor_portal' : 'user_app');
  const [reporterName, setReporterName] = useState(initialName || '');
  const [reporterEmail, setReporterEmail] = useState(initialEmail || '');
  const [reporterPhone, setReporterPhone] = useState('');
  const [entity, setEntity] = useState(entityName || '');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(userType === 'vendor' ? 'payouts' : 'billing');
  const [description, setDescription] = useState('');
  
  // UI Messages & Loading State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Tickets List & Active Thread State
  const [ticketsList, setTicketsList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialEmail) setReporterEmail(initialEmail);
      if (initialName) setReporterName(initialName);
      if (entityName) setEntity(entityName);
      loadTickets();
    }
  }, [isOpen, initialEmail, initialName, entityName, ticketUserType]);

  const loadTickets = async () => {
    try {
      const data = await api.getSupportTickets(ticketUserType, reporterEmail);
      if (Array.isArray(data)) setTicketsList(data);
    } catch (_) {}
  };

  const handleTicketSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !description.trim() || !reporterName.trim() || !reporterEmail.trim()) {
      setErrorMsg('Please fill in all mandatory fields (Name, Email, Subject, Description).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const payload = {
        user_type: ticketUserType,
        source: source,
        reporter_name: reporterName.trim(),
        reporter_email: reporterEmail.trim(),
        reporter_phone: reporterPhone.trim(),
        entity_name: entity.trim(),
        order_id: orderId.trim(),
        subject: subject.trim(),
        description: description.trim(),
        category: category,
        priority: 'low' // Default priority set to LOW (Admin adjusts accordingly)
      };

      const res = await api.createSupportTicket(payload);
      if (res && (res.success || res.data)) {
        const generatedTicket = {
          ticket_id: res.data?.ticket_id || `TCK-${Date.now()}`,
          subject: payload.subject,
          category: payload.category,
          order_id: payload.order_id,
          status: 'OPEN',
          user_type: payload.user_type,
          reporter_name: payload.reporter_name,
          reporter_email: payload.reporter_email,
          description: payload.description,
          created_at: new Date().toISOString(),
          ...res.data
        };
        setSubmittedTicket(generatedTicket);
        setSubject('');
        setDescription('');
        setOrderId('');
        loadTickets();
      } else {
        throw new Error(res?.error || 'Failed to submit ticket');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit support complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTicketThread = async (t) => {
    setSelectedTicket(t);
    try {
      const res = await api.getTicketMessages(t.ticket_id);
      if (res && res.messages) {
        setThreadMessages(res.messages);
      } else if (Array.isArray(res)) {
        setThreadMessages(res);
      } else {
        setThreadMessages(t.messages || []);
      }
    } catch (_) {
      setThreadMessages(t.messages || []);
    }
  };

  const handlePostReply = async (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      setReplyLoading(true);
      const res = await api.replySupportTicket(selectedTicket.ticket_id, {
        sender_role: ticketUserType,
        sender_name: reporterName || 'Applicant',
        content: replyText.trim()
      });

      if (res && res.data) {
        setThreadMessages(prev => [...prev, res.data]);
        setReplyText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  if (!isOpen) return null;

  const isVendorAccount = userType === 'vendor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white text-ink rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#541D26] text-white rounded-2xl flex items-center justify-center shadow-md">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#211A19]">DigiLocal Support Desk & Help Intake</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">Log complaints, billing queries, payout disputes & track resolution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#EEE5DA] rounded-full transition-all text-muted-foreground hover:text-ink cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* SECTION 4: CLEAR VENDOR VS RESIDENT SEPARATION FOR VENDOR ACCOUNTS  */}
        {/* ------------------------------------------------------------------- */}
        {isVendorAccount && (
          <div className="pt-3 pb-1">
            <p className="text-[11px] font-bold text-[#211A19] uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <span>Filing Complaint As:</span>
            </p>
            <div className="grid grid-cols-2 gap-2 bg-[#EEE5DA]/50 p-1.5 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => { setTicketUserType('vendor'); setSource('vendor_portal'); setCategory('payouts'); }}
                className={`py-2.5 px-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                  ticketUserType === 'vendor' 
                    ? 'bg-[#541D26] text-white shadow-md font-bold ring-2 ring-[#541D26]/30' 
                    : 'bg-white text-muted-foreground hover:text-ink border border-border/50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-[#C8A878]" />
                  <span className="text-xs">Vendor Merchant Store</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">Store Payouts, Catalog, Settlements & Listings</span>
              </button>

              <button
                type="button"
                onClick={() => { setTicketUserType('user'); setSource('user_app'); setCategory('billing'); }}
                className={`py-2.5 px-3 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer text-center ${
                  ticketUserType === 'user' 
                    ? 'bg-[#541D26] text-white shadow-md font-bold ring-2 ring-[#541D26]/30' 
                    : 'bg-white text-muted-foreground hover:text-ink border border-border/50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#C8A878]" />
                  <span className="text-xs">Resident Customer</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">Personal Home Orders, Resident Delivery & Refunds</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Controls (Submit vs History) */}
        <div className="flex items-center justify-between pt-2 pb-2">
          <div className="text-xs font-bold text-muted-foreground">
            {!isVendorAccount && (
              <span className="flex items-center gap-1 text-[#1E3623] bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                <User className="w-3.5 h-3.5" />
                <span>Resident Account Desk</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold ml-auto">
            <button
              onClick={() => { setActiveTab('new'); setSelectedTicket(null); setSubmittedTicket(null); }}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${activeTab === 'new' ? 'bg-[#541D26] text-white border-[#541D26] shadow-2xs' : 'bg-white text-[#211A19] border-border hover:bg-[#EEE5DA]'}`}
            >
              + Submit Complaint
            </button>
            <button
              onClick={() => { setActiveTab('history'); loadTickets(); }}
              className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === 'history' ? 'bg-[#541D26] text-white border-[#541D26] shadow-2xs' : 'bg-white text-[#211A19] border-border hover:bg-[#EEE5DA]'}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>My Tickets ({ticketsList.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto pt-2 space-y-4 pr-1">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 1: SUBMIT NEW SUPPORT COMPLAINT / THANK YOU CONFIRMATION  */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'new' && (
            submittedTicket ? (
              <div className="bg-[#FAF9F6] border border-[#C5A880]/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200 shadow-sm my-auto">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 shadow-sm">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                </div>

                <div>
                  <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded-full border border-emerald-300">
                    Ticket Generated Successfully
                  </span>
                  <h3 className="text-xl font-serif font-extrabold text-[#0A1428] mt-2">
                    Thank You! Your Support Request Has Been Created
                  </h3>
                  <p className="text-xs text-[#787F8C] mt-1 max-w-md mx-auto leading-relaxed font-medium">
                    Our support desk team has received your ticket and assigned it to a live support specialist. You can track real-time resolution updates in your ticket thread.
                  </p>
                </div>

                {/* Ticket Details Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-[#C5A880]/30 text-left space-y-2.5 shadow-xs max-w-lg mx-auto">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">Ticket Reference ID</span>
                    <span className="text-xs font-mono font-extrabold text-[#0A1428] bg-[#F6F3EC] px-2.5 py-0.5 rounded-md border border-[#C5A880]/30">
                      #{submittedTicket.ticket_id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Subject / Summary:</span>
                    <span className="font-bold text-ink truncate max-w-[240px]">{submittedTicket.subject}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Category:</span>
                    <span className="font-bold text-ink uppercase text-[10px] bg-secondary px-2 py-0.5 rounded-md border border-border">
                      {submittedTicket.category || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-semibold">Current Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Open & Assigned
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('history');
                      handleOpenTicketThread(submittedTicket);
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1E3623] hover:bg-[#122218] text-[#E6C35C] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#E6C35C]" />
                    <span>Track Ticket & View Discussion Thread</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setSuccessMsg('');
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-secondary text-ink font-bold text-xs border border-border uppercase tracking-wider transition-all cursor-pointer"
                  >
                    + Submit Another Complaint
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleTicketSubmit} className="space-y-3 text-xs font-semibold">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink font-bold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Aarav Gupta / Rajesh Sharma"
                      className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623]"
                    />
                  </div>

                  <div>
                    <label className="block text-ink font-bold mb-1">Contact Email Address *</label>
                    <input
                      type="email"
                      required
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="e.g. aarav@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623]"
                    />
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* SECTION 2: ORDER ID FIELD & CATEGORY FIELD                    */}
                {/* ------------------------------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink font-bold mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623] cursor-pointer"
                    >
                      {/* SECTION 3: RESIDENT vs VENDOR CATEGORY FILTERING */}
                      {ticketUserType === 'vendor' ? (
                        <>
                          <option value="payouts">💰 Vendor Settlement & Payouts</option>
                          <option value="catalog">📦 Shop Inventory & Product Catalog</option>
                          <option value="billing">💳 Billing & Commission Queries</option>
                          <option value="technical">🛠️ Vendor Portal Technical Issue</option>
                          <option value="general">❓ General Store Assistance</option>
                        </>
                      ) : (
                        <>
                          <option value="billing">💳 Billing & Refund Queries</option>
                          <option value="delivery">🚚 Order Delivery & Logistics</option>
                          <option value="technical">🛠️ App Technical Issue</option>
                          <option value="general">❓ General Platform Assistance</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-ink font-bold mb-1">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="e.g. ORD-984201"
                      className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-ink font-bold mb-1">Subject / Summary *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Order #ORD-984201 canceled but refund pending"
                    className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623]"
                  />
                </div>

                <div>
                  <label className="block text-ink font-bold mb-1">Detailed Description of Complaint *</label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide complete details including transaction details, issue timeline, or relevant store information..."
                    className="w-full px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-[#1E3623] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1E3623] hover:bg-[#122218] text-[#E6C35C] rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-3 group"
                >
                  <Send className="w-4 h-4 text-[#E6C35C] group-hover:translate-x-0.5 transition-transform" />
                  <span>{loading ? 'Submitting Ticket...' : 'Submit Support Intake Complaint'}</span>
                </button>
              </form>
            )
          )}

          {/* ------------------------------------------------------------- */}
          {/* VIEW 2: MY TICKETS LIST & THREAD DISCUSSION                   */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {!selectedTicket ? (
                <div>
                  {ticketsList.length === 0 ? (
                    <div className="p-8 text-center bg-secondary/20 rounded-3xl space-y-2 border border-border">
                      <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="font-serif font-bold text-sm text-ink">No Support Tickets Logged Yet</p>
                      <p className="text-xs text-muted-foreground">Click "+ Submit Complaint" to submit a new intake complaint to our helpdesk team.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {ticketsList.map((t) => (
                        <div
                          key={t.ticket_id}
                          onClick={() => handleOpenTicketThread(t)}
                          className="bg-white border border-border rounded-2xl p-4 shadow-sm hover:border-[#1E3623] transition-all cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-secondary rounded-lg text-ink">{t.ticket_id}</span>
                              {t.order_id && (
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg">Order: {t.order_id}</span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 
                                t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                              }`}>
                                {t.status}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full uppercase">
                                {t.priority || 'low'}
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-xs text-ink">{t.subject}</h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{t.description}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Ticket Thread Detail & Reply Form */
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-xs font-bold text-[#1E3623] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to All Tickets
                  </button>

                  <div className="bg-secondary/30 rounded-2xl p-4 border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#1E3623]">{selectedTicket.ticket_id}</span>
                        {selectedTicket.order_id && (
                          <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                            Order ID: {selectedTicket.order_id}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#1E3623] text-white rounded-full uppercase">
                        Priority: {selectedTicket.priority || 'low'}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-ink">{selectedTicket.subject}</h3>
                  </div>

                  {/* Messages List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {threadMessages.map((m, idx) => (
                      <div
                        key={m.message_id || idx}
                        className={`p-3.5 rounded-2xl max-w-[85%] space-y-1 text-xs ${
                          m.sender_role === 'admin' 
                            ? 'bg-[#1E3623] text-white ml-auto' 
                            : 'bg-white border border-border text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1 text-[10px] opacity-80">
                          <span className="font-bold">{m.sender_name || (m.sender_role === 'admin' ? 'DigiLocal Support Admin' : 'You')}</span>
                          <span>{new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="leading-relaxed">{m.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handlePostReply} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      required
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response message..."
                      className="flex-1 px-4 py-2.5 bg-secondary/30 border border-border rounded-xl text-xs font-semibold focus:outline-none focus:border-[#541D26]"
                    />
                    <button
                      type="submit"
                      disabled={replyLoading}
                      className="px-5 py-2.5 bg-[#541D26] hover:bg-[#6B2732] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border border-[#C8A878]/30 shadow-xs"
                    >
                      {replyLoading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
