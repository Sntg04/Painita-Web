// src/services/api.js
import axios from 'axios';

// Permite override vía variable de entorno en tiempo de build
// En Render, si servimos frontend y backend desde el mismo dominio, usar '/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

// Auth
export const createUser = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);

// OTP
export const sendOTP = (phone) => api.post('/send-otp', { phone });
export const verifyOTP = (phone, code) => api.post('/verify-otp', { phone, code });
export const resetPassword = (phone, code, password) => api.post('/reset-password', { phone, code, password });

export default api;
