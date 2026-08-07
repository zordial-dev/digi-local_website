import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBbfZPdWOGwHRAN1cNqoW3k-hm9H6czvXs",
  authDomain: "visitor-log-d3dd2.firebaseapp.com",
  projectId: "visitor-log-d3dd2",
  appId: "1:866177756650:web:8b8995179795218e0e5693"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Helper to setup recaptcha verifier safely
export const setupRecaptcha = (containerId = 'recaptcha-container') => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });
  }
  return window.recaptchaVerifier;
};

// Helper for sending SMS via Firebase Phone Auth
export const sendFirebasePhoneOtp = async (phoneNumber, containerId = 'recaptcha-container') => {
  try {
    const verifier = setupRecaptcha(containerId);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (err) {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (_) {}
      window.recaptchaVerifier = null;
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
