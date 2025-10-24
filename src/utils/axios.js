// import axios from 'axios'

// const axiosInstance = axios.create({
//     // baseURL: 'http://localhost:5000/api',
//     baseURL:'https://macstrombattle-api.kglame.com/api',
//     withCredentials: true,
//     headers: {
//         Authorization: `Bearer ${localStorage.getItem("authToken")}`,
//     },
// });
// export default axiosInstance;      

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://dev-macstrombattle-api.kglame.com/api',
  withCredentials: true,
});

// Interceptor to attach token dynamically on every request
axiosInstance.interceptors.request.use(
  (config) => {
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
