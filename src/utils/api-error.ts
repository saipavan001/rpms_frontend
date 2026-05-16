import { isAxiosError } from 'axios';

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const data = error.response?.data;

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.response?.status === 404) {
    return 'API endpoint not found. Ensure the backend is deployed with organization unit types support.';
  }

  if (error.response?.status === 401) {
    return 'Session expired. Please log in again.';
  }

  return fallback;
};
