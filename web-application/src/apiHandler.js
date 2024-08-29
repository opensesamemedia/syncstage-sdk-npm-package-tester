// apiHandler.js
import axios from 'axios';

import { getRefreshToken, getToken, setToken, setRefreshToken } from './auth';

const BASE_API_PATH = process.env.REACT_APP_BACKEND_BASE_PATH;

// Region: API calls for authentication
export const refreshToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${BASE_API_PATH}/refresh-token`, { refreshToken });
    const { idToken, refreshToken: newRefreshToken } = response.data;
    await setToken(idToken);
    await setRefreshToken(newRefreshToken);
    return idToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  console.log('login called');
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-in`, {
      username,
      password,
      origin: 'webpage',
    });
    console.log('response data: ', response.data);
    const { idToken, refreshToken: newRefreshToken } = response.data;
    await setToken(idToken);
    await setRefreshToken(newRefreshToken);

    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signInWithGoogle = async (credential) => {
  console.log('signInWithGoogle called');
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-in-google`, {
      credential,
      origin: 'webpage',
    });
    const { idToken, refreshToken: newRefreshToken } = response.data;
    console.log('response data: ', response.data);
    await setToken(idToken);
    await setRefreshToken(newRefreshToken);

    return response.data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signUp = async (name, email, password) => {
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-up`, {
      name,
      email,
      password,
      origin: 'webpage',
    });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Region: API calls for fetching data (need idToken)

const apiClient = axios.create({
  baseURL: BASE_API_PATH,
});

apiClient.interceptors.request.use(
  async (config) => {
    let token = getToken();
    if (!token) {
      token = await refreshToken();
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        setRefreshToken(newToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export const apiFetchSyncStageToken = async () => {
  try {
    const response = await apiClient.get(`/fetch-syncstage-token`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error('Access expired:', error);
      throw new Error('AccessExpired');
    } else {
      console.log('Error fetching token:', error);
    }
  }
};
