// src/admin/api.js
// Admin-panel calls, built on the shared client in ../api/client.js so the
// admin uses the same token and login as the rest of the site.

import { api as request, mediaUrl } from '../api/client';

export { mediaUrl };

export const api = {
  meta: () => request('/meta'),

  listProducts: (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request('/products' + (qs ? '?' + qs : ''));
  },

  getProduct: (id) => request(`/products/${id}`),

  createProduct: (formData) => request('/products', { method: 'POST', body: formData }),

  updateProduct: (id, formData) => request(`/products/${id}`, { method: 'PUT', body: formData }),

  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  getHome: () => request('/home'),

  saveHome: (newLaunches) => request('/admin/home', { method: 'PUT', body: { new_launches: newLaunches } }),

  listCombos: () => request('/admin/combos'),
  getCombo: (id) => request(`/admin/combos/${id}`),
  createCombo: (formData) => request('/admin/combos', { method: 'POST', body: formData }),
  updateCombo: (id, formData) => request(`/admin/combos/${id}`, { method: 'PUT', body: formData }),
  deleteCombo: (id) => request(`/admin/combos/${id}`, { method: 'DELETE' }),

  listFaqs: () => request('/admin/faqs'),
  createFaq: (faq) => request('/admin/faqs', { method: 'POST', body: faq }),
  updateFaq: (id, faq) => request(`/admin/faqs/${id}`, { method: 'PUT', body: faq }),
  deleteFaq: (id) => request(`/admin/faqs/${id}`, { method: 'DELETE' }),
  reorderFaqs: (ids) => request('/admin/faqs/reorder', { method: 'PUT', body: { ids } }),

  listUsers: () => request('/admin/users'),

  setUserRole: (id, role) => request(`/admin/users/${id}`, { method: 'PATCH', body: { role } }),

  stats: (year) => request('/admin/stats' + (year ? `?year=${year}` : '')),

  listOrders: (filters = {}) => {
    const qs = new URLSearchParams(
      Object.entries(filters).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request('/admin/orders' + (qs ? '?' + qs : ''));
  },

  getOrder: (orderId) => request(`/admin/orders/${encodeURIComponent(orderId)}`),

  setOrderStatus: (orderId, status) =>
    request(`/admin/orders/${encodeURIComponent(orderId)}`, { method: 'PATCH', body: { status } }),

  listReturns: (status) => request('/admin/returns' + (status ? `?status=${encodeURIComponent(status)}` : '')),

  setReturnStatus: (returnId, status) =>
    request(`/admin/returns/${encodeURIComponent(returnId)}`, { method: 'PATCH', body: { status } }),
};
