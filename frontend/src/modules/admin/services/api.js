import api from '../../../services/client';

export const adminAPI = {
  users: () => api.get('/admin/users/'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  students: () => api.get('/admin/students/'),
  reports: () => api.get('/admin/reports/'),
  categories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/categories/', data),
};
