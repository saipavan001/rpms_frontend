import axios, { isAxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type LoginApiResponse = {
  success?: boolean;
  data?: {
    token?: string;
    accessToken?: string;
  };
  token?: string;
  accessToken?: string;
};

export const extractAccessToken = (
  response: LoginApiResponse
): string | null => {
  const nestedToken =
    response.data?.token ?? response.data?.accessToken;

  if (nestedToken) {
    return nestedToken;
  }

  return response.token ?? response.accessToken ?? null;
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

export const getLoginErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  const status = error.response?.status;
  const apiMessage = extractApiMessage(error.response?.data);

  if (status === 400 || status === 401 || status === 403) {
    if (apiMessage && !looksLikeHttpError(apiMessage)) {
      return apiMessage;
    }

    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (status && status >= 500) {
    return 'Server error. Please try again later.';
  }

  if (apiMessage && !looksLikeHttpError(apiMessage)) {
    return apiMessage;
  }

  return INVALID_CREDENTIALS_MESSAGE;
};

export const loginApi = async (
  username: string,
  password: string
) => {

  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      username,
      password
    }
  );

  return response.data as LoginApiResponse;
};