import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  CreateOrganizationUnitInput,
  OrganizationUnit,
  UpdateOrganizationUnitInput,
} from '../types/organization-unit';

export const getOrganizationUnits = async (
  isActive?: boolean
): Promise<OrganizationUnit[]> => {
  const params =
    isActive === undefined
      ? undefined
      : { is_active: isActive ? 'true' : 'false' };

  const response = await apiClient.get<ApiResponse<OrganizationUnit[]>>(
    '/organization-units',
    { params }
  );

  return response.data.data;
};

export const getOrganizationUnitById = async (
  id: string
): Promise<OrganizationUnit> => {
  const response = await apiClient.get<ApiResponse<OrganizationUnit>>(
    `/organization-units/${id}`
  );

  return response.data.data;
};

export const createOrganizationUnit = async (
  input: CreateOrganizationUnitInput
): Promise<OrganizationUnit> => {
  const response = await apiClient.post<ApiResponse<OrganizationUnit>>(
    '/organization-units',
    input
  );

  return response.data.data;
};

export const updateOrganizationUnit = async (
  id: string,
  input: UpdateOrganizationUnitInput
): Promise<OrganizationUnit> => {
  const response = await apiClient.put<ApiResponse<OrganizationUnit>>(
    `/organization-units/${id}`,
    input
  );

  return response.data.data;
};

export const deleteOrganizationUnit = async (
  id: string
): Promise<OrganizationUnit> => {
  const response = await apiClient.delete<ApiResponse<OrganizationUnit>>(
    `/organization-units/${id}`
  );

  return response.data.data;
};
