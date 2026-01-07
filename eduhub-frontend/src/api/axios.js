import axios from 'axios';

// 1. Define the Base URL
// If we have a VITE_API_URL variable (Production), use it.
// Otherwise, fall back to localhost (Development).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

// 2. Create the Axios Instance
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important since you use Cookies/Sessions
    headers: {
        'Content-Type': 'application/json',
    }
});

// 3. (Optional) Add request interceptor to attach tokens if you use them
api.interceptors.request.use(
    (config) => {
        // If you store token in localStorage
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);