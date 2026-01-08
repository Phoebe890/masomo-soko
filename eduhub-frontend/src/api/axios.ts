import axios from 'axios';

// Get the backend URL from environment variables or default to local
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const api = axios.create({
    baseURL: BASE_URL,
    // CRITICAL: This allows the browser to send cookies (Session ID) 
    // to a different domain (e.g., from masomosoko.co.ke to api.masomosoko.co.ke)
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor: Adds the Bearer token if it exists in localStorage.
// This acts as a backup authentication method if cookies fail or for specific endpoints.
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

// Optional: Response Interceptor to handle session expiration globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If the server returns 401 (Unauthorized), it usually means the session/token expired
        if (error.response && error.response.status === 401) {
            console.warn("Session expired or unauthorized.");
            
             localStorage.clear();
             window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);