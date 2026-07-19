import axios from 'axios';

// Create an axios instance pointing to your live Render backend
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jungle2.onrender.com/api',
});

// Intercept requests to attach the JWT token automatically from localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;