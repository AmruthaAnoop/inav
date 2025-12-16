import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Read from environment variables (expo-constants with EXPO_PUBLIC_ prefix)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  Constants.expoConfig?.extra?.API_URL || 
  'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

// Log the base URL for debugging
console.log('API Base URL:', API_BASE_URL);

export default api;
