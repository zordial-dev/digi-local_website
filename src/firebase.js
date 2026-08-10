import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { api } from './services/api';

const firebaseConfig = {
  apiKey: "AIzaSyBkbIdA9m57t-qXZuQZpZReFzj55yELsTs",
  authDomain: "visitor-log-d3dd2.firebaseapp.com",
  projectId: "visitor-log-d3dd2",
  storageBucket: "visitor-log-d3dd2.firebasestorage.app",
  messagingSenderId: "866177756650",
  appId: "1:866177756650:web:2af4b3fc59946d9a0e5693",
  measurementId: "G-4LXEYZ8C7S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper to setup recaptcha verifier safely
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = containerId;
    document.body.appendChild(el);
  }

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (_) {}
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': () => {
      console.log('reCAPTCHA verified!');
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
    }
  });

  return window.recaptchaVerifier;
};

// Helper for sending real SMS via Firebase Phone Auth
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  // Ensure testing mode is false so real SMS is sent to mobile phone
  try {
    auth.settings.appVerificationDisabledForTesting = false;
  } catch (_) {}

  try {
    const verifier = setupRecaptcha(containerId);
    try { await verifier.render(); } catch (_) {}

    console.log(`📱 [FIREBASE SMS] Sending real SMS to ${phoneNumber}...`);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    console.log(`✅ [FIREBASE SMS SENT] SMS dispatched successfully to ${phoneNumber}`);
    return confirmationResult;
  } catch (err) {
    console.error('❌ [FIREBASE SMS ERROR]:', err?.message || err);

    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }

    // Second attempt with clean reCAPTCHA container
    try {
      const freshVerifier = setupRecaptcha(containerId);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, freshVerifier);
      window.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (retryErr) {
      console.error('❌ [FIREBASE SMS RETRY ERROR]:', retryErr?.message || retryErr);
      throw retryErr;
    }
  }
};

// Helper for verifying 6-digit code and returning Firebase ID Token
export const verifyFirebasePhoneOtp = async (code) => {
  if (!window.confirmationResult) {
    throw new Error('No active OTP session. Please request a new OTP code.');
  }
  const result = await window.confirmationResult.confirm(code);
  const user = result.user;
  const idToken = await user.getIdToken();
  return { user, idToken };
};
