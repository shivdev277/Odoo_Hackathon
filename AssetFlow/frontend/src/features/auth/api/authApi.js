import apiClient from '../../../services/apiClient';

const getErrorMessage = (error, fallbackMessage) => {
  const responseMessage = error?.response?.data?.error?.message
    || error?.response?.data?.message
    || error?.response?.data?.error;
  if (responseMessage) return responseMessage;
  if (error?.message) return error.message;
  return fallbackMessage;
};

const unwrapData = (response) => response?.data?.data ?? response?.data;

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return unwrapData(response);
  } catch (error) {
    const parsedError = new Error(getErrorMessage(error, 'Unable to sign in right now.'));
    parsedError.statusCode = error?.response?.status;
    parsedError.isNetworkError = !error?.response;
    throw parsedError;
  }
};

export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return unwrapData(response);
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return unwrapData(response);
  } catch (error) {
    const parsedError = new Error(getErrorMessage(error, 'Unable to load user profile.'));
    parsedError.statusCode = error?.response?.status;
    parsedError.isNetworkError = !error?.response;
    throw parsedError;
  }
};