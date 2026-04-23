import axios from 'axios';
const api = axios.create({ baseURL: 'https://lost-found-efcd.onrender.com' }); // Change to Render URL later

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export default api;