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

  listUsers: () => request('/admin/users'),

  setUserRole: (id, role) => request(`/admin/users/${id}`, { method: 'PATCH', body: { role } }),
};
