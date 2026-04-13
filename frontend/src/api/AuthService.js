import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const AuthService = {
    login: async (username, password, role = 'USER') => {
        try {
            const response = await axios.post(`${API_BASE_URL}/login/`, { username, password, role });
            if (response.data.user) {
                localStorage.setItem('sw_user', JSON.stringify(response.data.user));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error.response?.data?.error || 'Login failed';
        }
    },

    register: async (username, password, email, role = 'USER') => {
        try {
            const response = await axios.post(`${API_BASE_URL}/register/`, { username, password, email, role });
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error.response?.data?.error || 'Registration failed';
        }
    },

    logout: () => {
        localStorage.removeItem('sw_user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('sw_user');
        return user ? JSON.parse(user) : null;
    }
};

export default AuthService;
