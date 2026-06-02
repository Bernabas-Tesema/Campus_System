import api from '../../../services/client';

export const loungeAPI = {
  list: () => api.get('/lounges/'),
  getProfile: () => api.get('/lounge/profile/'),
  updateProfile: (data) => api.patch('/lounge/profile/', data),
  adminList: () => api.get('/admin/lounges/'),
  adminCreate: (data) => api.post('/admin/lounges/', data),
  adminUpdate: (id, data) => api.patch(`/admin/lounges/${id}/`, data),
  adminDelete: (id) => api.delete(`/admin/lounges/${id}/`),
};
