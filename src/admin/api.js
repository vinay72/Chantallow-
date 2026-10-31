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

  // picks: { new_launches | best_sellers | featured | tattoo: [id or { id, style?, label?, image? }] }, plus optional
  // expected: { <section>: [ids the page loaded] } to refuse saving over newer picks
  saveHome: (picks) => request('/admin/home', { method: 'PUT', body: picks }),

  // a card photo for one home page pick; resolves to { url }
  uploadHomeImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/admin/home/image', { method: 'POST', body: fd });
  },

  getAbout: () => request('/about'),
  // body: the whole About Us page — { founder, cta, illuminate } (no `items`; see below)
  saveAbout: (about) => request('/admin/about', { method: 'PUT', body: about }),

  // "Illuminate Beauty" product highlights — each its own row, not part of saveAbout
  listHighlights: () => request('/admin/about/highlights'),
  createHighlight: (highlight) => request('/admin/about/highlights', { method: 'POST', body: highlight }),
  updateHighlight: (id, highlight) => request(`/admin/about/highlights/${id}`, { method: 'PUT', body: highlight }),
  deleteHighlight: (id) => request(`/admin/about/highlights/${id}`, { method: 'DELETE' }),
  reorderHighlights: (ids) => request('/admin/about/highlights/reorder', { method: 'PUT', body: { ids } }),

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

  getUser: (id) => request(`/admin/users/${id}`),

  listPosts: () => request('/admin/blog'),
  getPost: (id) => request(`/admin/blog/${id}`),
  createPost: (post) => request('/admin/blog', { method: 'POST', body: post }),
  updatePost: (id, post) => request(`/admin/blog/${id}`, { method: 'PUT', body: post }),
  deletePost: (id) => request(`/admin/blog/${id}`, { method: 'DELETE' }),

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
