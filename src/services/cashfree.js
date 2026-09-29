import { load } from '@cashfreepayments/cashfree-js';

let cashfreeInstancePromise = null;

/**
 * Pre-initialize and cache the Cashfree Web SDK in production mode
 * Call this on page/component mount to avoid popup blocking
 */
export async function getCashfree() {
  if (!cashfreeInstancePromise) {
    try {
      cashfreeInstancePromise = load({ mode: 'production' });
    } catch (err) {
      console.error('Failed to initialize Cashfree SDK:', err);
      cashfreeInstancePromise = null;
      throw err;
    }
  }
  return await cashfreeInstancePromise;
}

/**
 * Open Cashfree Checkout Modal for an existing payment session
 * @param {string} paymentSessionId - Cashfree PG v3 payment session ID
 * @param {Function} [onPaid] - Callback when payment completes in modal
 * @param {Function} [onCancelled] - Callback when modal is closed or payment cancelled
 * @returns {Promise<object>}
 */
export async function openCashfreeModal(paymentSessionId, onPaid, onCancelled) {
  if (!paymentSessionId) {
    throw new Error('Payment session ID is required to launch Cashfree modal.');
  }

  const cashfree = await getCashfree();
  if (!cashfree) {
    throw new Error('Cashfree Web SDK is not available.');
  }

  const result = await cashfree.checkout({
    paymentSessionId: paymentSessionId,
    redirectTarget: '_modal' // Keeps user inline on your website
  });

  if (result.error) {
    console.warn('Cashfree payment dismissed or failed:', result.error);
    if (onCancelled) onCancelled(result.error);
    return result;
  }

  if (result.paymentDetails) {
    console.log('Cashfree payment approved in modal:', result.paymentDetails);
    if (onPaid) onPaid(result.paymentDetails);
    return result;
  }

  return result;
}
