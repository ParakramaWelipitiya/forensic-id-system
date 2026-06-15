// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
    // This points to your Node.js backend
    baseURL: 'http://localhost:5000/api', 
});

export default api;