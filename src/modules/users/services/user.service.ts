import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  CreateUserInput,
  Role,
  UpdateUserInput,
  User,
} from '../types/user';

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');
  return response.data.data;
};

export const getAssignableRoles = async (): Promise<Role[]> => {
  const response = await apiClient.get<ApiResponse<Role[]>>(
    '/roles/assignable'
  );
  return response.data.data;
};

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const response = await apiClient.post<ApiResponse<User>>('/users', input);
  return response.data.data;
};

export const updateUser = async (
  id: string,
  input: UpdateUserInput
): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, input);
  return response.data.data;
};

export const deleteUser = async (id: string): Promise<User> => {
  const response = await apiClient.delete<ApiResponse<User>>(`/users/${id}`);
  return response.data.data;
};
