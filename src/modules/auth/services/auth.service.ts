import axios, { isAxiosError } from 'axios';

import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type { AuthUser } from '../../../shared/auth/permissions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type LoginApiResponse = {
  success?: boolean;
  data?: {
    token?: string;
    user?: AuthUser;
  };
};

export const extractAccessToken = (
  response: LoginApiResponse
): string | null => response.data?.token ?? null;

export const extractAuthUser = (
  response: LoginApiResponse
): AuthUser | null => response.data?.user ?? null;

export const loginApi = async (username: string, password: string) => {
  const response = await axios.post<LoginApiResponse>(
    `${API_BASE_URL}/auth/login`,
    { username, password }
  );

  return response.data;
};

export type EmployeeSignupInput = {
  employee_code: string;
  username: string;
  password: string;
};

export const registerEmployeeApi = async (input: EmployeeSignupInput) => {
  const response = await axios.post<LoginApiResponse>(
    `${API_BASE_URL}/auth/register/employee`,
    input
  );

  return response.data;
};

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return response.data.data;
};

const INVALID_CREDENTIALS_MESSAGE =
  'Invalid username or password. Please check your credentials and try again.';

const extractApiMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;

  for (const key of ['message', 'error', 'detail']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
};

const looksLikeHttpError = (message: string): boolean => {
  const normalized = message.toLowerCase().trim();

  return (
    /request failed with status code/i.test(message) ||
    /status code \d+/i.test(message) ||
    /^\d{3}$/.test(normalized) ||
    normalized === 'bad request' ||
    normalized === 'unauthorized' ||
    normalized === 'forbidden'
  );
};

export const getAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const status = error.response?.status;
  const apiMessage = extractApiMessage(error.response?.data);

  if (status === 400 || status === 401 || status === 403 || status === 409) {
    if (apiMessage && !looksLikeHttpError(apiMessage)) {
      return apiMessage;
    }
  }

  if (status && status >= 500) {
    return 'Server error. Please try again later.';
  }

  if (apiMessage && !looksLikeHttpError(apiMessage)) {
    return apiMessage;
  }

  return fallback;
};

export const getLoginErrorMessage = (error: unknown): string =>
  getAuthErrorMessage(error, INVALID_CREDENTIALS_MESSAGE);

export const getSignupErrorMessage = (error: unknown): string =>
  getAuthErrorMessage(error, 'Registration failed. Please check your details.');
