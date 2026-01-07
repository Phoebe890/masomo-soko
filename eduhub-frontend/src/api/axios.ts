import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Optional: Keep the interceptor if you had it, otherwise just the above is fine
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);