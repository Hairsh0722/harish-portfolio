import axios from 'axios';

const api = axios.create({
  // Use the environment variable, or fallback to localhost for dev
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Optional: Add an interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Something went wrong in api...");
    return Promise.reject(error);
  }
);

export default api;