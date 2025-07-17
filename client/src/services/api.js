import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Forms API
export const formsAPI = {
  createForm: (formData) => api.post('/forms', formData),
  getForms: () => api.get('/forms'),
  getForm: (id) => api.get(`/forms/${id}`),
  getPublicForm: (publicId) => api.get(`/forms/public/${publicId}`),
  updateForm: (id, formData) => api.put(`/forms/${id}`, formData),
  deleteForm: (id) => api.delete(`/forms/${id}`),
};

// Responses API
export const responsesAPI = {
  submitResponse: (formId, answers) => api.post('/responses', { formId, answers }),
  submitPublicResponse: (publicId, answers) => api.post(`/responses/public/${publicId}`, { answers }),
  getFormResponses: (formId, page = 1, limit = 50) => 
    api.get(`/responses/form/${formId}?page=${page}&limit=${limit}`),
  getFormSummary: (formId) => api.get(`/responses/form/${formId}/summary`),
  exportFormResponses: (formId) => api.get(`/responses/form/${formId}/export`, {
    responseType: 'blob',
  }),
};

export default api;
