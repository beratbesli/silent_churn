import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const longClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000,
});

let accessToken = '';

const authorize = (config) => {
  if (accessToken && !config.headers.Authorization) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};

const addInterceptors = (client) => {
  client.interceptors.request.use(authorize);
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      return Promise.reject(error);
    }
  );
};

addInterceptors(apiClient);
addInterceptors(longClient);

const api = {
  getCustomers: () => apiClient.get('/customers'),
  getCustomer: (id) => apiClient.get(`/customers/${id}`),
  getCustomerTimeline: (id) => apiClient.get(`/customers/${id}/timeline`),
  getDashboardStats: () => apiClient.get('/customers/dashboard-stats'),
  refreshAnalysis: (mode = 'demo') => longClient.post(`/refresh-analysis?mode=${mode}`),
  generateData: (adminToken) => apiClient.post('/generate-data', null, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }),
  generateDraftReply: (id) => longClient.post(`/customers/${id}/draft-reply`),
  chatWithData: (message) => longClient.post('/chat', { message }),
  getLocalModels: () => apiClient.get('/providers/local-models'),
  connectProvider: (config) => apiClient.post('/providers/connect', config),
  getCurrentProvider: () => apiClient.get('/providers/current'),
  disconnectProvider: () => apiClient.post('/providers/disconnect'),
  setAccessToken: (token) => { accessToken = token; },
};

export default api;
