import axios from 'axios'

// const axiosInstance = axios.create({
//     // baseURL: 'http://localhost:5000/api',
//     baseURL:'http://localhost:5000/api',
//     withCredentials: true,
//     headers: {
//         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//     },
// });
// export default axiosInstance;      

const axiosInstance = axios.create({
  // baseURL: 'https://api-v1.macstrombattle.com/api',
  // baseURL: 'https://macstrombattle-api.kglame.com/api',
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Generate or retrieve device ID
const getOrCreateDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    // Generate a unique device ID
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Interceptor to attach token and device ID dynamically on every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Add device ID to all requests
    const deviceId = getOrCreateDeviceId();
    config.headers['x-device-id'] = deviceId;

    // Add authorization token if available
    const token = localStorage.getItem("authToken"); // get latest token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; // remove header if no token
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
