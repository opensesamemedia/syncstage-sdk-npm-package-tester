// auth.js
import Cookies from 'js-cookie';

const TOKEN_KEY = 'idToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getToken = () => Cookies.get(TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

export const setToken = (token) => Cookies.set(TOKEN_KEY, token, { secure: true, sameSite: 'Strict' });
export const setRefreshToken = (token) => Cookies.set(REFRESH_TOKEN_KEY, token, { secure: true, sameSite: 'Strict' });

export const clearTokens = () => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
