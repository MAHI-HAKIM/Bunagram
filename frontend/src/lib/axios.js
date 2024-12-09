import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api/',
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken"); // Get the token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach the token
    }
    return config;
  });