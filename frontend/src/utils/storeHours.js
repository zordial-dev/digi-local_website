/**
 * Parses a time string like "08:00 AM" or "10:30 PM" into 24-hour { hours, minutes }.
 * Returns null if parsing fails.
 */
const parseTime12h = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'AM') {
    if (hours === 12) hours = 0;
  } else {
    if (hours !== 12) hours += 12;
  }
  return { hours, minutes };
};

/**
 * Returns true if the store is currently open based on opening/closing timings.
 * Supports overnight stores (e.g. open 10 PM → 6 AM).
 * @param {string} opening_timing  e.g. "08:00 AM"
 * @param {string} closing_timing  e.g. "10:00 PM"
 * @returns {{ isOpen: boolean, opensAt: string, closesAt: string, nextOpenIn: string }}
 */
export const getStoreStatus = (opening_timing, closing_timing) => {
  const open = parseTime12h(opening_timing);
  const close = parseTime12h(closing_timing);

  if (!open || !close) {
    return { isOpen: true, opensAt: opening_timing || '—', closesAt: closing_timing || '—', nextOpenIn: '' };
  }

  const now = new Date();
  const openMins = open.hours * 60 + open.minutes;
  const closeMins = close.hours * 60 + close.minutes;
  const nowMins = now.getHours() * 60 + now.getMinutes();

  let isOpen;
  if (openMins < closeMins) {
    // Normal day hours: e.g. 08:00 AM → 10:00 PM
    isOpen = nowMins >= openMins && nowMins < closeMins;
  } else {
    // Overnight hours: e.g. 10:00 PM → 06:00 AM
    isOpen = nowMins >= openMins || nowMins < closeMins;
  }

  // Calculate "opens in X hours Y mins" when closed
  let nextOpenIn = '';
  if (!isOpen) {
    let diffMins;
    if (nowMins < openMins) {
      diffMins = openMins - nowMins;
    } else {
      diffMins = (24 * 60 - nowMins) + openMins;
    }
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    nextOpenIn = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  return {
    isOpen,
    opensAt: opening_timing || '—',
    closesAt: closing_timing || '—',
    nextOpenIn
  };
};
