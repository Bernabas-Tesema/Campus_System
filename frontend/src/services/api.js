import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/login/', data),
  register: (data) => api.post('/register/', data),
  logout: (refresh) => api.post('/logout/', { refresh }),
  profile: () => api.get('/profile/'),
};

export const foodAPI = {
  list: (params) => api.get('/foods/', { params }),
  categories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/categories/', data),
  manage: () => api.get('/foods/manage/'),
  create: (data) => api.post('/foods/manage/', data),
  update: (id, data) => api.patch(`/foods/manage/${id}/`, data),
  delete: (id) => api.delete(`/foods/manage/${id}/`),
};

export const orderAPI = {
  list: () => api.get('/orders/'),
  create: (data) => api.post('/orders/', data),
  detail: (id) => api.get(`/orders/${id}/`),
  updateStatus: (id, status) => api.patch(`/orders/status/${id}/`, { status }),
  loungeOrders: (params) => api.get('/lounge/orders/', { params }),
  loungeUpdateStatus: (id, status) => api.patch(`/lounge/orders/${id}/status/`, { status }),
};

export const loungeAPI = {
  list: () => api.get('/lounges/'),
  adminList: () => api.get('/admin/lounges/'),
  adminCreate: (data) => api.post('/admin/lounges/', data),
  adminUpdate: (id, data) => api.patch(`/admin/lounges/${id}/`, data),
};

export const adminAPI = {
  users: () => api.get('/admin/users/'),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  students: () => api.get('/admin/students/'),
  reports: () => api.get('/admin/reports/'),
  categories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/categories/', data),
};

export const notificationAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.patch(`/notifications/${id}/read/`),
  markAllRead: () => api.post('/notifications/read-all/'),
};

export default api;
