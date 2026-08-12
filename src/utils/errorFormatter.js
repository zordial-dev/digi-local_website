/**
 * Formats technical or Firebase auth errors into clean, user-friendly sentences,
 * eliminating technical jargon, raw codes, or "Firebase" branding.
 */
export function formatUserFacingError(err, context = 'phone') {
  if (!err) return '';

  const str = typeof err === 'string' ? err : (err.message || String(err || ''));

  // 1. Rate Limiting & Too Many Requests
  if (str.includes('too-many-requests') || str.includes('TOO_MANY_ATTEMPTS') || str.includes('quota-exceeded')) {
    return 'Too many verification requests for this mobile number. Please wait a few minutes before trying again.';
  }

  // 2. Invalid Phone Number Format
  if (str.includes('invalid-phone-number') || str.includes('INVALID_PHONE_NUMBER')) {
    return 'Please enter a valid 10-digit mobile phone number.';
  }

  // 3. Security / App Credential / reCAPTCHA Issues
  if (str.includes('invalid-app-credential') || str.includes('captcha') || str.includes('app-not-authorized') || str.includes('reCAPTCHA')) {
    return 'Security verification check failed. Please refresh the page and try again.';
  }

  // 4. Incorrect or Expired OTP Verification Code
  if (str.includes('invalid-verification-code') || str.includes('code-expired') || str.includes('session-expired') || str.includes('INVALID_OTP')) {
    return 'Incorrect verification code. Please check your SMS and try again.';
  }

  // 5. User Account Existing / Not Found
  if (str.includes('already-exists') || str.includes('already in use') || str.includes('already exists')) {
    return 'An account with this mobile number already exists. Please log in instead.';
  }
  if (str.includes('user-not-found') || str.includes('account does not exist') || str.includes('not found')) {
    return 'No account found with this mobile number. Please register your account first.';
  }

  // 6. Incorrect Password
  if (str.includes('wrong-password') || str.includes('Password incorrect') || str.includes('password incorrect') || str.includes('Incorrect password')) {
    return 'Password incorrect. Please check your password and try again.';
  }

  // 7. Strip any residual "Firebase: Error (auth/...)" or "Firebase:" prefixes cleanly
  let cleaned = str
    .replace(/^Firebase:\s*Error\s*\(auth\/[^\)]+\)\.?/i, '')
    .replace(/^Firebase:\s*/i, '')
    .replace(/auth\/[a-z0-9-]+/gi, '')
    .replace(/[\(\)]/g, '')
    .trim();

  // Ensure capital first letter and ending period
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (!cleaned.endsWith('.')) cleaned += '.';
    return cleaned;
  }

  return context === 'phone'
    ? 'Unable to send SMS verification code to this mobile number. Please try again.'
    : 'Verification failed. Please check your inputs and try again.';
}
