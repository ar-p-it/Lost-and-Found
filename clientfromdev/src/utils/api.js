// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:7777',
    withCredentials: true, // needed for cookies
});

export default api;