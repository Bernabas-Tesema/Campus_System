import api from '../../../services/client';

export const foodAPI = {
  list: (params) => api.get('/foods/', { params }),
  get: (id) => api.get(`/foods/${id}/`),
  categories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/categories/', data),
  manage: () => api.get('/foods/manage/'),
  create: (data) => api.post('/foods/manage/', data),
  update: (id, data) => api.patch(`/foods/manage/${id}/`, data),
  delete: (id) => api.delete(`/foods/manage/${id}/`),
};
