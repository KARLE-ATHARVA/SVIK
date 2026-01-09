import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true, // 🔥 THIS IS THE KEY
});

// OPTIONAL: global error handling


export default api;
