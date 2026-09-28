/**
 * Formats technical, JavaScript, or Firebase auth errors into clean, user-friendly sentences,
 * eliminating technical jargon, raw codes, variable names, or "Firebase" branding.
 */
export function formatUserFacingError(err, context = 'phone') {
  if (!err) return '';

  const str = typeof err === 'string' ? err : (err.message || String(err || ''));
  const strLower = str.toLowerCase();

  // 0. Technical JavaScript Developer / Reference / Undefined Errors
  if (
    strLower.includes('is not defined') ||
    strLower.includes('cannot read property') ||
    strLower.includes('cannot read properties') ||
    strLower.includes('undefined is not') ||
    strLower.includes('null is not') ||
    strLower.includes('typeerror') ||
    strLower.includes('referenceerror') ||
    strLower.includes('syntaxerror')
  ) {
    if (strLower.includes('token') || strLower.includes('session') || strLower.includes('auth') || strLower.includes('refreshtoken')) {
      return 'Your login session has expired. Please sign in again to continue.';
    }
    return 'Unable to complete request right now. Please refresh the page and try again.';
  }

  // 1. Token / Session Expiration
  if (strLower.includes('refreshtoken') || strLower.includes('token expired') || strLower.includes('session expired') || strLower.includes('unauthorized')) {
    return 'Your login session has expired. Please sign in again to continue.';
  }

  // 2. Network / Connection Errors
  if (strLower.includes('failed to fetch') || strLower.includes('networkerror') || strLower.includes('network error') || strLower.includes('connection')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }

  // 3. SMS Gateway Limits & Credits Exhausted
  if (strLower.includes('sms_credits_exhausted') || strLower.includes('credits exhausted') || strLower.includes('gateway limits')) {
    return 'SMS service is temporarily unavailable due to gateway limits. Please use Email OTP or contact support.';
  }
  if (strLower.includes('sms_gateway_error') || strLower.includes('gateway error') || strLower.includes('sms delivery failed')) {
    return 'SMS service is temporarily unavailable. Please try again or use Email OTP.';
  }

  // 4. Rate Limiting & Too Many Requests
  if (strLower.includes('too-many-requests') || strLower.includes('too_many_attempts') || strLower.includes('quota-exceeded')) {
    return 'Too many verification requests for this mobile number. Please wait a few minutes before trying again.';
  }

  // 5. Invalid Phone Number Format
  if (strLower.includes('invalid-phone-number') || strLower.includes('invalid_phone_number')) {
    return 'Please enter a valid 10-digit mobile phone number.';
  }

  // 5. Security / App Credential / reCAPTCHA Issues
  if (strLower.includes('invalid-app-credential') || strLower.includes('captcha') || strLower.includes('app-not-authorized') || strLower.includes('recaptcha')) {
    return 'Security verification check failed. Please refresh the page and try again.';
  }

  // 6. Incorrect or Expired OTP Verification Code
  if (strLower.includes('invalid-verification-code') || strLower.includes('code-expired') || strLower.includes('session-expired') || strLower.includes('invalid_otp')) {
    return 'Incorrect verification code. Please check your SMS and try again.';
  }

  // 7. User Account Existing / Not Found
  if (strLower.includes('already-exists') || strLower.includes('already in use') || strLower.includes('already exists')) {
    return 'An account with this mobile number or email already exists. Please log in instead.';
  }
  if (strLower.includes('user-not-found') || strLower.includes('account does not exist') || strLower.includes('vendor not found') || strLower.includes('not registered') || strLower.includes('no registered')) {
    return 'No registered account found with this phone / email. Please click Register to create your account.';
  }

  // 8. Incorrect Password or Invalid Credentials
  if (
    strLower.includes('wrong-password') ||
    strLower.includes('password incorrect') ||
    strLower.includes('incorrect password') ||
    strLower.includes('invalid password') ||
    strLower.includes('invalid credentials') ||
    strLower.includes('invalid email or password') ||
    strLower.includes('invalid phone or password')
  ) {
    return 'Incorrect password or credentials. Please check your password and try again, or use OTP login.';
  }

  // If error is a JSON string e.g. {"error": "..."}, parse it
  if (str.startsWith('{') && str.endsWith('}')) {
    try {
      const parsed = JSON.parse(str);
      const innerMsg = parsed.error || parsed.message || parsed.detail;
      if (innerMsg && typeof innerMsg === 'string') {
        return formatUserFacingError(innerMsg, context);
      }
    } catch (_) {}
  }

  // 9. Strip any residual "Firebase: Error (auth/...)" or "Firebase:" prefixes cleanly
  let cleaned = str
    .replace(/^Firebase:\s*Error\s*\(auth\/[^\)]+\)\.?/i, '')
    .replace(/^Firebase:\s*/i, '')
    .replace(/auth\/[a-z0-9-]+/gi, '')
    .replace(/[\(\)]/g, '')
    .trim();

  // If the error message is too long, contains URLs, or developer stack traces, use a clean fallback
  if (cleaned.length > 120 || cleaned.includes('http') || cleaned.includes('{') || cleaned.includes('at ')) {
    return 'Incorrect login credentials. Please check your phone/email and password, or log in via OTP.';
  }

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
