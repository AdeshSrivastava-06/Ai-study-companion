import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auto-refresh token on 401
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                try {
                    const res = await axios.post('/api/auth/refresh/', { refresh });
                    localStorage.setItem('access_token', res.data.access);
                    error.config.headers.Authorization = `Bearer ${res.data.access}`;
                    return axios(error.config);
                } catch {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default API;
