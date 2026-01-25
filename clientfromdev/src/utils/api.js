// src/utils/api.js
import axios from 'axios';
import { BASE_URL } from './constants';

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // needed for cookies
});

export default api;