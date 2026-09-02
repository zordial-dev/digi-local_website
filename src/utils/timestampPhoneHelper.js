/**
 * Timestamp & Phone Payload Specification v3.7.0 Helper
 * Formats timestamps into UTC (created_at), IST offset (created_at_ist), and Readable IST (created_at_readable).
 * Standardizes phone fields into country_code ("+91") and phone_number ("9784319840").
 */

/**
 * Format date/timestamp input into differentiated IST timestamp attributes
 */
export function formatIstTimestamp(dateInput) {
  if (!dateInput) {
    const now = new Date();
    return formatIstTimestamp(now);
  }

  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      const now = new Date();
      return formatIstTimestamp(now);
    }

    const created_at = d.toISOString();

    // IST is UTC + 5:30 (330 minutes)
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffsetMs);

    const year = istDate.getUTCFullYear();
    const monthNum = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(istDate.getUTCDate()).padStart(2, '0');
    const hours24 = String(istDate.getUTCHours()).padStart(2, '0');
    const minsStr = String(istDate.getUTCMinutes()).padStart(2, '0');
    const secsStr = String(istDate.getUTCSeconds()).padStart(2, '0');

    const created_at_ist = `${year}-${monthNum}-${dayStr}T${hours24}:${minsStr}:${secsStr}+05:30`;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[istDate.getUTCMonth()];

    let hours12 = istDate.getUTCHours();
    const ampm = hours12 >= 12 ? 'pm' : 'am';
    hours12 = hours12 % 12;
    if (hours12 === 0) hours12 = 12;
    const hours12Str = String(hours12).padStart(2, '0');

    const created_at_readable = `${dayStr} ${monthName} ${year}, ${hours12Str}:${minsStr} ${ampm} IST`;

    return {
      created_at,
      created_at_ist,
      created_at_readable
    };
  } catch (_) {
    const fallbackIso = new Date().toISOString();
    return {
      created_at: fallbackIso,
      created_at_ist: fallbackIso.replace('Z', '+05:30'),
      created_at_readable: 'Just now'
    };
  }
}

/**
 * Standardize Phone Payload attributes to strictly country_code and phone_number
 */
export function normalizePhonePayload(phoneInput, countryCodeInput = '+91') {
  if (typeof phoneInput === 'object' && phoneInput !== null) {
    const rawNumber = phoneInput.phone_number || phoneInput.phone || phoneInput.mobile || phoneInput.whatsapp_number || '';
    const rawCc = phoneInput.country_code || countryCodeInput || '+91';
    return normalizePhonePayload(rawNumber, rawCc);
  }

  const rawStr = String(phoneInput || '').replace(/[^0-9]/g, '');
  const cleanNumber = rawStr.length >= 10 ? rawStr.slice(-10) : rawStr;
  const cc = (countryCodeInput && countryCodeInput.startsWith('+')) ? countryCodeInput : `+${countryCodeInput || '91'}`;

  return {
    country_code: cc.startsWith('+') ? cc : `+${cc}`,
    phone_number: cleanNumber
  };
}

/**
 * Format object or phone fields for human display (e.g. "+91 9784319840")
 */
export function formatDisplayPhone(objOrPhone, defaultCc = '+91') {
  const norm = normalizePhonePayload(objOrPhone, defaultCc);
  if (!norm.phone_number) return '';
  return `${norm.country_code} ${norm.phone_number}`;
}
