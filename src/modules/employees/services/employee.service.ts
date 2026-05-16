import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  BulkCreateEmployeeResult,
  CreateEmployeeInput,
  Employee,
  UpdateEmployeeInput,
} from '../types/employee';

export const getEmployees = async (isActive?: boolean): Promise<Employee[]> => {
  const params =
    isActive === undefined
      ? undefined
      : { is_active: isActive ? 'true' : 'false' };

  const response = await apiClient.get<ApiResponse<Employee[]>>('/employees', {
    params,
  });

  return response.data.data;
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const response = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);

  return response.data.data;
};

export const createEmployee = async (
  input: CreateEmployeeInput
): Promise<Employee> => {
  const response = await apiClient.post<ApiResponse<Employee>>(
    '/employees',
    input
  );

  return response.data.data;
};

export const bulkCreateEmployees = async (
  employees: CreateEmployeeInput[]
): Promise<BulkCreateEmployeeResult> => {
  const response = await apiClient.post<ApiResponse<BulkCreateEmployeeResult>>(
    '/employees/bulk',
    { employees }
  );

  return response.data.data;
};

export const updateEmployee = async (
  id: string,
  input: UpdateEmployeeInput
): Promise<Employee> => {
  const response = await apiClient.put<ApiResponse<Employee>>(
    `/employees/${id}`,
    input
  );

  return response.data.data;
};

export const deleteEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.delete<ApiResponse<Employee>>(
    `/employees/${id}`
  );

  return response.data.data;
};
