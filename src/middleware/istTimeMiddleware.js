/**
 * Indian Standard Time (IST, UTC+05:30) Global Middleware & Enrichment Utility
 * Injects corresponding `_ist` (ISO 8601 with +05:30) and `_readable` strings (e.g. "30 Sep 2026, 12:20 pm IST")
 * across all date/timestamp fields in API responses.
 */

const DATE_KEY_REGEX = /(_at|createdAt|updatedAt|timestamp|order_timestamp|date|deadline)$/i;

/**
 * Convert any standard date string or timestamp into IST ISO string and human-readable string.
 * @param {string|number|Date} dateVal 
 * @returns {{ ist: string, readable: string } | null}
 */
function convertToIST(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return null;

  // Calculate IST (UTC + 5 hours 30 minutes)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(d.getTime() + istOffsetMs);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');

  // ISO 8601 with explicit +05:30 timezone offset
  const istISO = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+05:30`;

  // Readable format: "30 Sep 2026, 12:20 pm IST"
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mName = monthNames[istDate.getUTCMonth()];
  let h12 = istDate.getUTCHours();
  const ampm = h12 >= 12 ? 'pm' : 'am';
  h12 = h12 % 12;
  if (h12 === 0) h12 = 12;
  const h12Str = String(h12).padStart(2, '0');

  const readable = `${day} ${mName} ${year}, ${h12Str}:${minutes} ${ampm} IST`;

  return {
    ist: istISO,
    readable: readable
  };
}

/**
 * Recursively enriches an object or array with IST companion fields
 * @param {any} obj 
 * @param {WeakSet} seen 
 * @returns {any}
 */
function enrichWithIST(obj, seen = new WeakSet()) {
  if (!obj || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return obj;
  seen.add(obj);

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = enrichWithIST(obj[i], seen);
    }
    return obj;
  }

  const keys = Object.keys(obj);
  for (const key of keys) {
    const val = obj[key];

    // If it's a nested object or array, recurse
    if (val && typeof val === 'object' && !(val instanceof Date)) {
      obj[key] = enrichWithIST(val, seen);
      continue;
    }

    // Check if key represents a timestamp / date
    if (typeof val === 'string' || val instanceof Date || typeof val === 'number') {
      const isDateKey = DATE_KEY_REGEX.test(key) || key === 'date' || key === 'timestamp';
      if (isDateKey) {
        // Exclude plain numeric IDs
        if (typeof val === 'number' && val < 100000000000) {
          continue;
        }

        const istResult = convertToIST(val);
        if (istResult) {
          if (key === 'created_at') {
            obj.created_at_ist = istResult.ist;
            obj.created_at_readable = istResult.readable;
          } else if (key === 'updated_at') {
            obj.updated_at_ist = istResult.ist;
            obj.updated_at_readable = istResult.readable;
          } else if (key === 'createdAt') {
            obj.createdAt_ist = istResult.ist;
            obj.created_at_ist = istResult.ist;
            obj.created_at_readable = istResult.readable;
          } else if (key === 'updatedAt') {
            obj.updatedAt_ist = istResult.ist;
            obj.updated_at_ist = istResult.ist;
            obj.updated_at_readable = istResult.readable;
          } else if (key.endsWith('_at')) {
            const basePrefix = key.slice(0, -3);
            obj[`${key}_ist`] = istResult.ist;
            obj[`${basePrefix}_readable`] = istResult.readable;
            obj[`${key}_readable`] = istResult.readable;
          } else if (key === 'date') {
            obj.date_ist = istResult.ist;
            obj.date_readable = istResult.readable;
          } else if (key === 'timestamp' || key === 'order_timestamp') {
            obj[`${key}_ist`] = istResult.ist;
            obj[`${key}_readable`] = istResult.readable;
          } else if (key.endsWith('deadline') || key.endsWith('Deadline') || key.endsWith('_deadline')) {
            obj[`${key}_ist`] = istResult.ist;
            obj[`${key}_readable`] = istResult.readable;
          }
        }
      }
    } else if (val === null && DATE_KEY_REGEX.test(key)) {
      if (key === 'updated_at') {
        if (obj.updated_at_ist === undefined) obj.updated_at_ist = null;
        if (obj.updated_at_readable === undefined) obj.updated_at_readable = null;
      } else if (key === 'updatedAt') {
        if (obj.updatedAt_ist === undefined) obj.updatedAt_ist = null;
        if (obj.updated_at_ist === undefined) obj.updated_at_ist = null;
        if (obj.updated_at_readable === undefined) obj.updated_at_readable = null;
      }
    }
  }

  return obj;
}

/**
 * Middleware function for Express or HTTP server
 */
function istTimeMiddleware(req, res, next) {
  const originalJson = res.json;
  if (originalJson) {
    res.json = function (data) {
      const enriched = enrichWithIST(data);
      return originalJson.call(this, enriched);
    };
  }
  if (typeof next === 'function') next();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertToIST,
    enrichWithIST,
    istTimeMiddleware
  };
}

export { convertToIST, enrichWithIST, istTimeMiddleware };
