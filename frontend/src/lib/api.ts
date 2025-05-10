import axios, { AxiosInstance } from 'axios';

const API_CONFIG = {
  PRODUCT_SERVICE: process.env.NEXT_PUBLIC_PRODUCT_SERVICE_URL || 'http://localhost:8080',
  USER_SERVICE: process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:8081',
  ORDER_SERVICE: process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:8083',
};

export const productApi = axios.create({
  baseURL: API_CONFIG.PRODUCT_SERVICE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const userApi = axios.create({
  baseURL: API_CONFIG.USER_SERVICE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderApi = axios.create({
  baseURL: API_CONFIG.ORDER_SERVICE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
const addAuthToken = (api: AxiosInstance) => {
  api.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};

// Add auth token to all API instances
addAuthToken(userApi);
addAuthToken(orderApi);
addAuthToken(productApi); 