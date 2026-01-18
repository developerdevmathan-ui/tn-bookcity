import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Accept': 'application/json'
    }
});

// Interceptor: Before sending ANY request, check for a token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Attach the token to the header automatically
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let axios handle it
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
        // Set default JSON content type for non-FormData requests
        config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
});

export default api;