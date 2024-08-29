// auth.js
import Cookies from 'js-cookie';

const TOKEN_KEY = 'idToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getToken = () => Cookies.get(TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

const waitForToken = async (key, expectedValue, timeout = 5000, interval = 100) => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (Cookies.get(key) === expectedValue) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  throw new Error(`Timeout: Token ${key} was not set correctly`);
};

export const setToken = async (token) => {
  console.log('setting token:', token);
  Cookies.set(TOKEN_KEY, token, { secure: true, sameSite: 'Strict' });
  console.log('setToken called');
  await waitForToken(TOKEN_KEY, token);
  console.log('setToken done');
};
export const setRefreshToken = async (token) => {
  console.log('setting refresh token:', token);
  Cookies.set(REFRESH_TOKEN_KEY, token, { secure: true, sameSite: 'Strict' });
  console.log('setRefreshToken called');
  await waitForToken(REFRESH_TOKEN_KEY, token);
  console.log('setRefreshToken done');
};

export const clearTokens = () => {
  console.log('clearing tokens from cookies');
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
