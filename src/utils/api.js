/**
 * API Client for Nimo's Limerick
 *
 * Centralised HTTP client with automatic auth header injection,
 * error handling, and grouped endpoint functions for every API route.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'nimos_token';

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const REQUEST_TIMEOUT = 10000; // 10 seconds
const NETWORK_RETRY_COUNT = 1; // 1 automatic retry on network errors

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Strip Content-Type for FormData (let browser set boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const maxAttempts = 1 + (options.retries ?? NETWORK_RETRY_COUNT);
  let lastError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || REQUEST_TIMEOUT);

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      lastError = err;

      // Only retry on network errors (not AbortError from caller's own signal)
      const isNetworkError = err.name !== 'AbortError' || !options.signal?.aborted;
      if (isNetworkError && attempt < maxAttempts - 1) {
        // Brief delay before retry
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out. Please check your connection and try again.', 0, null);
      }
      throw new ApiError('Network error. Please check your internet connection.', 0, null);
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle 204 No Content
    if (res.status === 204) {
      return null;
    }

    // Attempt to parse JSON body regardless of status
    let data;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      // Clear token on 401 (expired or invalid)
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
      }

      const message =
        res.status === 401 ? (data?.message || 'Session expired. Please log in again.') :
        res.status === 403 ? (data?.message || 'You do not have permission to perform this action.') :
        res.status === 404 ? (data?.message || 'The requested resource was not found.') :
        res.status >= 500 ? (data?.message || 'Server error. Please try again later.') :
        data?.error || data?.message || res.statusText || 'Request failed';

      // Do NOT retry on HTTP errors (4xx/5xx) -- only network failures
      throw new ApiError(message, res.status, data);
    }

    return data;
  }

  // Should not reach here, but handle edge case
  throw lastError || new ApiError('Request failed after retries.', 0, null);
}

// ---------------------------------------------------------------------------
// Standalone fetch wrapper (not tied to API_BASE or auth)
// ---------------------------------------------------------------------------

/**
 * General-purpose fetch wrapper with timeout, retry on network errors,
 * and consistent error objects.
 *
 * Usage:
 *   const { data, error } = await apiFetch('https://example.com/api/data');
 *   if (error) console.log(error.message, error.status);
 *
 * @param {string} url  Full URL to fetch
 * @param {object} options  Standard fetch options + { timeout, retries }
 * @returns {Promise<{ data?: any, error?: { error: true, message: string, status: number } }>}
 */
export async function apiFetch(url, options = {}) {
  const maxAttempts = 1 + (options.retries ?? NETWORK_RETRY_COUNT);
  const timeout = options.timeout || REQUEST_TIMEOUT;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let res;
    try {
      res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);

      const isNetworkError = err.name !== 'AbortError' || !options.signal?.aborted;
      if (isNetworkError && attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }

      const message = err.name === 'AbortError'
        ? 'Request timed out.'
        : 'Network error. Please check your internet connection.';
      return { error: { error: true, message, status: 0 } };
    } finally {
      clearTimeout(timeoutId);
    }

    // Do NOT retry on HTTP errors
    if (!res.ok) {
      let body;
      try {
        body = await res.json();
      } catch {
        body = null;
      }
      return {
        error: {
          error: true,
          message: body?.message || body?.error || res.statusText || 'Request failed',
          status: res.status,
        },
      };
    }

    // Parse successful response
    let data;
    if (res.status === 204) {
      data = null;
    } else {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    }

    return { data };
  }

  return { error: { error: true, message: 'Request failed after retries.', status: 0 } };
}

// Convenience wrappers
function get(path) {
  return request(path, { method: 'GET' });
}

function post(path, body) {
  return request(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function put(path, body) {
  return request(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

function del(path) {
  return request(path, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  login(email, password) {
    return post('/auth/login', { email, password });
  },

  register(name, email, phone, password) {
    return post('/auth/register', { name, email, phone, password });
  },

  getMe() {
    return get('/auth/me');
  },
};

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

export const menu = {
  getMenu() {
    return get('/menu');
  },

  searchMenu(query) {
    return get(`/menu/search?q=${encodeURIComponent(query)}`);
  },

  getReviews(limit = 10) {
    return get(`/menu/reviews?limit=${limit}`);
  },
};

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export const orders = {
  placeOrder(orderData) {
    return post('/orders', orderData);
  },

  getOrders() {
    return get('/orders');
  },

  getOrder(id) {
    return get(`/orders/${encodeURIComponent(id)}`);
  },

  validatePromo(code, subtotal) {
    return post('/orders/validate-promo', { code, subtotal });
  },
};

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

export const customer = {
  getFavourites() {
    return get('/customer/favourites');
  },

  addFavourite(menuItemId) {
    return post('/customer/favourites', { menu_item_id: menuItemId });
  },

  removeFavourite(itemId) {
    return del(`/customer/favourites/${encodeURIComponent(itemId)}`);
  },

  getAddresses() {
    return get('/customer/addresses');
  },

  addAddress(label, address, isDefault = false) {
    return post('/customer/addresses', {
      label,
      address,
      is_default: isDefault,
    });
  },

  updateAddress(id, data) {
    return put(`/customer/addresses/${encodeURIComponent(id)}`, data);
  },

  deleteAddress(id) {
    return del(`/customer/addresses/${encodeURIComponent(id)}`);
  },

  submitReview(orderId, rating, comment) {
    return post('/customer/reviews', {
      order_id: orderId,
      rating,
      comment,
    });
  },

  getLoyalty() {
    return get('/customer/loyalty');
  },

  getNotificationPrefs() {
    return get('/customer/notifications');
  },

  updateNotificationPrefs(prefs) {
    return put('/customer/notifications', prefs);
  },

  updateProfile(data) {
    return put('/customer/profile', data);
  },
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const admin = {
  getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.date) query.set('date', params.date);
    const qs = query.toString();
    return get(`/admin/orders${qs ? `?${qs}` : ''}`);
  },

  /**
   * Subscribe to real-time order updates via Server-Sent Events.
   * Returns an EventSource instance. Caller must close it when done.
   */
  streamOrders() {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const url = `${API_BASE}/admin/orders/stream`;
    // EventSource does not support custom headers, so pass token as query param.
    // The backend should accept ?token= as an alternative auth mechanism for SSE.
    return new EventSource(`${url}${token ? `?token=${token}` : ''}`);
  },

  updateOrderStatus(id, status) {
    return put(`/admin/orders/${encodeURIComponent(id)}/status`, { status });
  },

  getDashboard() {
    return get('/admin/dashboard');
  },

  getReports(from, to) {
    const query = new URLSearchParams();
    if (from) query.set('from', from);
    if (to) query.set('to', to);
    const qs = query.toString();
    return get(`/admin/reports${qs ? `?${qs}` : ''}`);
  },

  getSettings() {
    return get('/admin/settings');
  },

  updateSettings(settings) {
    return put('/admin/settings', settings);
  },

  toggleOpen() {
    return post('/admin/toggle-open');
  },

  toggleBusy() {
    return post('/admin/toggle-busy');
  },

  togglePause() {
    return post('/admin/toggle-pause');
  },

  getPromos() {
    return get('/admin/promos');
  },

  createPromo(promo) {
    return post('/admin/promos', promo);
  },

  updatePromo(id, promo) {
    return put(`/admin/promos/${encodeURIComponent(id)}`, promo);
  },

  deletePromo(id) {
    return del(`/admin/promos/${encodeURIComponent(id)}`);
  },

  getCustomers() {
    return get('/admin/customers');
  },

  addMenuItem(item) {
    return post('/admin/menu', item);
  },

  updateMenuItem(id, item) {
    return put(`/admin/menu/${encodeURIComponent(id)}`, item);
  },

  deleteMenuItem(id) {
    return del(`/admin/menu/${encodeURIComponent(id)}`);
  },
};

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export const payments = {
  createSession(data) {
    return post('/payments/create-session', data);
  },

  getConfig() {
    return get('/payments/config');
  },
};

// ---------------------------------------------------------------------------
// Token helpers (used by auth context / hooks)
// ---------------------------------------------------------------------------

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
}

export { ApiError, API_BASE };
