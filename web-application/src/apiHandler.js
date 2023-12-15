// apiHandler.js
import axios from 'axios';

const BASE_API_PATH = process.env.REACT_APP_BACKEND_BASE_PATH || 'http://localhost:3000/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_API_PATH}/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const fetchSyncStageToken = async (userToken) => {
  try {
    const response = await axios.get(`${BASE_API_PATH}/fetch-token`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};
