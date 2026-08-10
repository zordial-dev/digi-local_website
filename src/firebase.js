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
export const setupRecaptcha = async (containerId = 'recaptcha-container') => {
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

  const verifier = new RecaptchaVerifier(auth, el, {
    'size': 'invisible',
    'callback': () => {
      console.log('reCAPTCHA solved!');
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
    }
  });

  try {
    await verifier.render();
  } catch (renderErr) {
    console.warn('reCAPTCHA render notice:', renderErr);
  }

  window.recaptchaVerifier = verifier;
  return verifier;
};

// Helper for sending SMS via Firebase Phone Auth
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  console.log(`📱 [FIREBASE PHONE AUTH] Requesting SMS for ${phoneNumber}...`);

  // Clean up any existing verifier
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch (_) {}
    window.recaptchaVerifier = null;
  }

  const verifier = await setupRecaptcha(containerId);

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    console.log(`✅ [FIREBASE PHONE AUTH SUCCESS] Session created for ${phoneNumber}`);
    return confirmationResult;
  } catch (err) {
    console.error('❌ [FIREBASE PHONE AUTH ERROR]:', err?.code || err?.message || err);

    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }

    throw err;
  }
};

// Helper for verifying 6-digit code and returning Firebase ID Token
export const verifyFirebasePhoneOtp = async (code) => {
  if (!window.confirmationResult || typeof window.confirmationResult.confirm !== 'function') {
    throw new Error('No active Firebase OTP session. Please click Send OTP first.');
  }
  console.log('🔍 [FIREBASE VERIFY] Confirming 6-digit code with Firebase...');
  const result = await window.confirmationResult.confirm(code);
  const user = result.user;
  const idToken = await user.getIdToken();
  console.log('✅ [FIREBASE VERIFY SUCCESS] Firebase ID Token obtained for UID:', user.uid);
  return { user, idToken };
};
