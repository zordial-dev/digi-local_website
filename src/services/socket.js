import { io } from 'socket.io-client';

let socket = null;

const getSocketBaseUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    try {
      const parsed = new URL(envUrl);
      return parsed.origin;
    } catch (_) {
      return envUrl.replace(/\/api\/?$/, '');
    }
  }
  return 'https://digi-local-backend.onrender.com';
};

export function getSocket() {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    const socketUrl = getSocketBaseUrl();
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('⚡ [DigiLocal Socket.IO] Connected successfully:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ [DigiLocal Socket.IO] Connection notice:', err.message);
    });

    // Global listener for ORDER_CANCELLED
    socket.on('ORDER_CANCELLED', (payload) => {
      console.log('🔔 [DigiLocal Socket.IO] Global ORDER_CANCELLED event:', payload);
      if (payload && (payload.order_id || payload.id)) {
        const orderId = payload.order_id || payload.id;
        try {
          // Update active order in local storage
          const activeStr = localStorage.getItem('digilocal_active_order');
          if (activeStr) {
            const activeObj = JSON.parse(activeStr);
            if (String(activeObj.order_id || activeObj.id) === String(orderId)) {
              const updatedActive = {
                ...activeObj,
                status: 'CANCELLED',
                order_status: 'CANCELLED',
                cancel_reason: payload.cancel_reason || payload.reason || activeObj.cancel_reason,
                payment_status: payload.payment_status || activeObj.payment_status,
                refund_status: payload.refund_status || activeObj.refund_status,
                refund_status_label: payload.refund_status_label || activeObj.refund_status_label,
                is_refund_in_progress: payload.is_refund_in_progress !== undefined ? payload.is_refund_in_progress : true,
                refund: payload.refund || activeObj.refund
              };
              localStorage.setItem('digilocal_active_order', JSON.stringify(updatedActive));
            }
          }

          // Update orders in cached list
          const cachedStr = localStorage.getItem('digilocal_cached_orders');
          if (cachedStr) {
            const list = JSON.parse(cachedStr);
            if (Array.isArray(list)) {
              const updatedList = list.map(o => {
                if (String(o.order_id || o.id) === String(orderId)) {
                  return {
                    ...o,
                    status: 'CANCELLED',
                    order_status: 'CANCELLED',
                    cancel_reason: payload.cancel_reason || payload.reason || o.cancel_reason,
                    payment_status: payload.payment_status || o.payment_status,
                    refund_status: payload.refund_status || o.refund_status,
                    refund_status_label: payload.refund_status_label || o.refund_status_label,
                    is_refund_in_progress: payload.is_refund_in_progress !== undefined ? payload.is_refund_in_progress : true,
                    refund: payload.refund || o.refund
                  };
                }
                return o;
              });
              localStorage.setItem('digilocal_cached_orders', JSON.stringify(updatedList));
            }
          }
        } catch (_) {}

        // Dispatch DOM event for reactive components
        window.dispatchEvent(new CustomEvent('digilocal_order_cancelled', { detail: payload }));
        window.dispatchEvent(new CustomEvent('digilocal_order_status_update', {
          detail: {
            order_id: orderId,
            status: 'CANCELLED',
            cancel_reason: payload.cancel_reason || payload.reason,
            payment_status: payload.payment_status,
            refund_status_label: payload.refund_status_label,
            is_refund_in_progress: payload.is_refund_in_progress,
            refund: payload.refund
          }
        }));
      }
    });

    // Global listener for ORDER_STATUS_UPDATED
    socket.on('ORDER_STATUS_UPDATED', (payload) => {
      console.log('🔔 [DigiLocal Socket.IO] Global ORDER_STATUS_UPDATED event:', payload);
      if (payload && (payload.order_id || payload.id)) {
        const orderId = payload.order_id || payload.id;
        const newStatus = payload.status || payload.order_status;
        try {
          const activeStr = localStorage.getItem('digilocal_active_order');
          if (activeStr) {
            const activeObj = JSON.parse(activeStr);
            if (String(activeObj.order_id || activeObj.id) === String(orderId)) {
              const updated = {
                ...activeObj,
                status: newStatus,
                order_status: newStatus,
                ...(payload.payment_status ? { payment_status: payload.payment_status } : {}),
                ...(payload.refund_status_label ? { refund_status_label: payload.refund_status_label } : {})
              };
              localStorage.setItem('digilocal_active_order', JSON.stringify(updated));
            }
          }
        } catch (_) {}

        window.dispatchEvent(new CustomEvent('digilocal_order_status_update', {
          detail: {
            order_id: orderId,
            status: newStatus,
            ...payload
          }
        }));
      }
    });
  }

  return socket;
}

export function joinOrderRoom(orderId) {
  if (!orderId) return;
  const s = getSocket();
  if (s) {
    const cleanId = String(orderId).trim();
    s.emit('join_order_room', cleanId);
    s.emit('join_order_room', `order_${cleanId}`);
  }
}

export function joinUserRoom(userId) {
  if (!userId) return;
  const s = getSocket();
  if (s) {
    const cleanId = String(userId).trim();
    s.emit('join_user_room', cleanId);
    s.emit('join_user_room', `user_${cleanId}`);
  }
}

export function joinVendorRoom(vendorId) {
  if (!vendorId) return;
  const s = getSocket();
  if (s) {
    const cleanId = String(vendorId).trim();
    s.emit('join_vendor_room', cleanId);
    s.emit('join_vendor_room', `vendor_${cleanId}`);
  }
}
