import api from '../../../services/client';

export const authAPI = {
  login: (data) => api.post('/login/', data),
  register: (data) => api.post('/register/', data),
  logout: (refresh) => api.post('/logout/', { refresh }),
  profile: () => api.get('/profile/'),
  update: (data) => api.patch('/profile/', data),
  passwordReset: (data) => api.post('/password-reset/', data),
  passwordResetConfirm: (data) => api.post('/password-reset/confirm/', data),
};
