import axios from 'axios';

// Get the backend URL from environment variables or default to local
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const api = axios.create({
    baseURL: BASE_URL,
    // Set to false for JWT (Bearer token) based authentication to avoid CORS issues
    withCredentials: false, 
    headers: {}
    
});

// Request Interceptor: Adds the Bearer token if it exists in localStorage.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handles Session Expiration
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // CASE 1: 401 Unauthorized (Token Expired or Invalid)
        //  SHOULD logout here
        if (error.response && error.response.status === 401) {
            console.warn('Session expired (401). Logging out...');
            localStorage.clear();
            sessionStorage.clear();
            
            // Only redirect if not already on auth pages
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        // CASE 2: 403 Forbidden (Valid Token, but Permission Denied)
        //  SHOULD NOT logout here. It just means the user can't touch that specific button/page.
        if (error.response && error.response.status === 403) {
            console.warn('Access Denied (403). Permissions issue.');
            // Do NOT clear localStorage.
        }

        return Promise.reject(error);
    }
);