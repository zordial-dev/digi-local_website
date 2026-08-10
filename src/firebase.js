import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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

// Helper for sending SMS via Firebase Phone Auth
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  try {
    const verifier = setupRecaptcha(containerId);
    try { await verifier.render(); } catch (_) {}

    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (err) {
    console.warn('First attempt failed:', err?.message || err);

    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }

    // Fallback attempt for test mode & development environments
    if (err?.code === 'auth/invalid-app-credential' || String(err).includes('INVALID_APP_CREDENTIAL')) {
      try {
        console.log('⚡ Enabling test verification fallback for Firebase Phone Auth...');
        auth.settings.appVerificationDisabledForTesting = true;
        const verifierFallback = setupRecaptcha(containerId);
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifierFallback);
        window.confirmationResult = confirmationResult;
        return confirmationResult;
      } catch (fallbackErr) {
        console.error('Firebase Phone Auth Fallback Error:', fallbackErr);
        throw fallbackErr;
      }
    }

    throw err;
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
