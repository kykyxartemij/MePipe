import axios from 'axios';
import { ApiError } from '../models/api-error';

const axiosClient = axios.create();

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
