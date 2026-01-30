import axios from 'axios';

console.log('AXIOS BASE URL:', import.meta.env.VITE_API_BASE_URL);

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000, // Optional: 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json ,multipart/formdata'
    }
});

export default axiosInstance;
