/**
 * Indian Standard Time (IST, UTC+05:30) Frontend Utilities
 * Supports system-wide IST standardized date display.
 */

import { convertToIST, enrichWithIST } from '../middleware/istTimeMiddleware';

/**
 * Format any timestamp or entity into human-readable Indian Standard Time string.
 * e.g., "30 Sep 2026, 12:20 pm IST"
 * 
 * If the object already has `created_at_readable` or `updated_at_readable`, it returns that directly.
 * 
 * @param {string|number|Date|object} input 
 * @returns {string}
 */
export function formatISTReadable(input) {
  if (!input) return 'Recently';

  if (typeof input === 'object' && !(input instanceof Date)) {
    if (input.created_at_readable) return input.created_at_readable;
    if (input.updated_at_readable) return input.updated_at_readable;
    if (input.createdAt_readable) return input.createdAt_readable;
    if (input.date_readable) return input.date_readable;
    if (input.created_at) return formatISTReadable(input.created_at);
    if (input.createdAt) return formatISTReadable(input.createdAt);
    if (input.updated_at) return formatISTReadable(input.updated_at);
    if (input.timestamp) return formatISTReadable(input.timestamp);
    if (input.date) return formatISTReadable(input.date);
  }

  const istRes = convertToIST(input);
  return istRes ? istRes.readable : String(input);
}

/**
 * Get ISO 8601 string with +05:30 offset
 * @param {string|number|Date} input 
 * @returns {string}
 */
export function getISTISO(input) {
  if (!input) return '';
  const istRes = convertToIST(input);
  return istRes ? istRes.ist : '';
}

export { convertToIST, enrichWithIST };
