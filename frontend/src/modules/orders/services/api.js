import api from '../../../services/client';

export const orderAPI = {
  list: () => api.get('/orders/'),
  create: (data) => api.post('/orders/', data),
  detail: (id) => api.get(`/orders/${id}/`),
  updateStatus: (id, status) => api.patch(`/orders/status/${id}/`, { status }),
  loungeOrders: (params) => api.get('/lounge/orders/', { params }),
  loungeUpdateStatus: (id, status, extra = {}) => api.patch(`/lounge/orders/${id}/status/`, { status, ...extra }),
};
