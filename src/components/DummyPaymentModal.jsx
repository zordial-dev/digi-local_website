import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  QrCode, 
  ArrowRight, 
  AlertCircle, 
  Banknote,
  Sparkles,
  Lock
} from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';

export default function DummyPaymentModal({
  isOpen,
  onClose,
  amount = 0,
  title = "DigiLocal Dummy Payment Gateway",
  description = "Complete payment in test mode",
  onSuccess,
  onFailure
}) {
  useScrollLock(isOpen);
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastTxn, setLastTxn] = useState(null);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;

  // Quick preset test card loader
  const handleFillTestCard = () => {
    setCardNumber('4532 8901 2345 6789');
    setCardExpiry('12/28');
    setCardCvv('789');
    setCardName('Demo Resident');
  };

  // Quick preset test UPI loader
  const handleFillTestUpi = () => {
    setUpiId('digilocal.resident@okicici');
  };

  // Simulate payment processing
  const handlePay = (simulateFailure = false) => {
    setErrorMsg('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      if (simulateFailure) {
        setErrorMsg('Simulated Payment Failed: Card declined by issuing bank (Test Mode).');
        if (onFailure) onFailure();
        return;
      }

      const txnId = `TXN_${Date.now().toString().slice(-6)}_${Math.floor(100 + Math.random() * 900)}`;
      const txnData = {
        transactionId: txnId,
        paymentMethod: activeTab === 'upi' ? `UPI (${upiId || 'Demo UPI'})` 
                     : activeTab === 'card' ? `Card (•••• ${cardNumber.slice(-4) || '6789'})`
                     : activeTab === 'netbanking' ? `NetBanking (${selectedBank})`
                     : 'Cash on Delivery',
        amount: numAmount,
        timestamp: new Date().toLocaleString(),
        status: 'SUCCESS'
      };

      setLastTxn(txnData);
      setPaymentSuccess(true);

      if (onSuccess) {
        onSuccess(txnData);
      }
    }, 1200);
  };

  const handleResetAndClose = () => {
    setPaymentSuccess(false);
    setIsProcessing(false);
    setErrorMsg('');
    setLastTxn(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-[2.5rem] max-w-lg w-full shadow-2xl overflow-hidden relative text-foreground">
        
        {/* Gateway Header */}
        <div className="bg-[#541D26] text-[#F7F4EE] px-6 py-5 flex items-center justify-between border-b border-[#C8A878]/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 p-1 flex items-center justify-center border border-white/15">
              <img src="/logo.png" alt="DigiLocal Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-serif font-black uppercase tracking-wider text-white">
                  {title}
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-black bg-[#C8A878] text-[#541D26] rounded-md uppercase tracking-widest">
                  Secure Gateway
                </span>
              </div>
              <p className="text-[11px] text-[#EEE5DA]/80 font-medium">{description}</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        {!paymentSuccess ? (
          <div className="p-6 space-y-6">
            
            {/* Total Amount Badge */}
            <div className="p-4 rounded-2xl bg-secondary/80 border border-border flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Payable Amount</span>
                <span className="text-xs text-muted-foreground">Zero Platform Fees • Instant Confirmation</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-serif font-black text-primary">₹{numAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-[11px] font-black text-ink uppercase tracking-wider mb-2">
                Select Payment Mode (Dummy)
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTab === 'upi'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px]">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTab === 'card'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px]">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTab === 'netbanking'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[10px]">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('cod')}
                  className={`py-2.5 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    activeTab === 'cod'
                      ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20'
                      : 'border-border bg-background text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-[10px]">On Delivery</span>
                </button>
              </div>
            </div>

            {/* TAB 1: UPI & QR Code */}
            {activeTab === 'upi' && (
              <div className="space-y-4 bg-secondary/40 p-4 rounded-2xl border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-ink flex items-center space-x-1.5">
                    <QrCode className="w-4 h-4 text-gold" />
                    <span>Scan UPI QR Code</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFillTestUpi}
                    className="text-[10px] font-extrabold text-primary hover:underline"
                  >
                    + Auto-fill Test VPA
                  </button>
                </div>

                {/* Simulated QR Code Graphic */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 rounded-2xl border border-border">
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                    <div className="w-full h-full bg-gradient-to-tr from-emerald-900 to-[#C4A066] rounded-lg p-1.5 flex items-center justify-center">
                      <QrCode className="w-full h-full text-white" />
                    </div>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                      <span className="text-xs font-extrabold text-ink">Accepted UPI Apps</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">Google Pay, PhonePe, Paytm, CRED, BHIM</p>
                    <p className="text-[10px] text-emerald-700 font-bold">VPA: digilocal.pay@icici</p>
                  </div>
                </div>

                {/* Manual UPI ID Input */}
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                    Or Enter Your UPI ID (VPA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mobile@upi or name@okaxis"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: CREDIT / DEBIT CARDS */}
            {activeTab === 'card' && (
              <div className="space-y-3.5 bg-secondary/40 p-4 rounded-2xl border border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-ink">Card Details</span>
                  <button
                    type="button"
                    onClick={handleFillTestCard}
                    className="text-[10px] font-extrabold text-primary hover:underline"
                  >
                    + Auto-Fill Test Card
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4532 8901 2345 6789"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-ink font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-ink font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="789"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-ink font-mono font-bold focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Name on Card</label>
                  <input
                    type="text"
                    placeholder="Resident User"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs text-ink font-semibold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: NET BANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3.5 bg-secondary/40 p-4 rounded-2xl border border-border">
                <span className="text-xs font-extrabold text-ink block mb-1">Select Bank for NetBanking</span>
                
                <div className="grid grid-cols-3 gap-2">
                  {['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB'].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-2.5 rounded-xl border text-xs font-black transition-all ${
                        selectedBank === bank
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : 'border-border bg-background text-ink hover:bg-secondary'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground text-center font-medium pt-1">
                  Selected Bank: <strong className="text-ink">{selectedBank} Bank (Sandbox)</strong>
                </p>
              </div>
            )}

            {/* TAB 4: CASH ON DELIVERY */}
            {activeTab === 'cod' && (
              <div className="space-y-2 bg-secondary/40 p-4 rounded-2xl border border-border text-center">
                <Banknote className="w-8 h-8 text-gold mx-auto mb-1" />
                <h4 className="text-xs font-bold text-ink">Pay Cash / Scan Vendor QR at Doorstep</h4>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Pay directly to vendor staff upon delivery at your residential society flat.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePay(false)}
                className="w-full py-4 rounded-full bg-primary hover:bg-gold text-primary-foreground hover:text-ink font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 border border-primary/20 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Payment (Simulated)...</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-gold" />
                    <span>Pay ₹{numAmount.toFixed(2)} (Simulate Instant Success)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePay(true)}
                className="w-full py-2.5 rounded-full bg-transparent border border-border hover:bg-rose-50 hover:text-rose-700 text-muted-foreground text-[11px] font-extrabold uppercase tracking-wider transition-colors"
              >
                Test Failed Payment Simulation
              </button>
            </div>

            <div className="flex items-center justify-center space-x-1.5 text-[10px] text-muted-foreground font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Encrypted Dummy Payment Sandbox</span>
            </div>

          </div>
        ) : (
          /* Payment Success View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-full inline-block mb-2 uppercase tracking-widest border border-emerald-300">
                Payment Authorized
              </span>
              <h3 className="text-2xl font-serif font-black text-ink">₹{lastTxn?.amount.toFixed(2)} Paid Successfully!</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Your transaction has been processed successfully.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-2xl bg-secondary border border-border text-left text-xs space-y-2 shadow-sm">
              <div className="flex justify-between items-center border-b border-border/60 pb-2">
                <span className="text-muted-foreground font-semibold">Transaction Reference:</span>
                <span className="font-mono font-bold text-ink">{lastTxn?.transactionId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Payment Mode:</span>
                <span className="font-bold text-primary">{lastTxn?.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-semibold">Timestamp:</span>
                <span className="font-semibold text-ink">{lastTxn?.timestamp}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-wider shadow-xl transition-all"
            >
              Continue & Return to Website
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
