// apiHandler.js
import axios from 'axios';

const BASE_API_PATH = '/api';

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-in`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const signInWithGoogle = async (credential) => {
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-in-google`, {
      credential,
    });
    return response.data;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const apiFetchSyncStageToken = async (userToken) => {
  try {
    const response = await axios.get(`${BASE_API_PATH}/fetch-syncstage-token`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.error('Access expired:', error);
      throw new Error('AccessExpired');
    } else {
      console.error('Error fetching token:', error);
      throw error;
    }
  }
};

export const signUp = async (name, email, password) => {
  try {
    const response = await axios.post(`${BASE_API_PATH}/sign-up`, {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};
