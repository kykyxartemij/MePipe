import axios from 'axios';
import { ApiError } from '../models/api-error';

const axiosClient = axios.create({
  // baseURL: '/api',
  timeout: 10000,
});

// When the body is FormData let the browser set Content-Type (multipart + boundary).
// Axios v1 serializes FormData to JSON if it sees Content-Type: application/json.
axiosClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type'); // AxiosHeaders API — delete works; bracket-delete does not
  }
  return config;
});

// Response interceptor: normalize errors into custom ApiError
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      throw ApiError.fromAxios(error);
    }
    throw error;
  }
);

export default axiosClient;
