import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  CreateOrgUnitTypeInput,
  OrgUnitType,
  UpdateOrgUnitTypeInput,
} from '../types/org-unit-type';

export const getOrgUnitTypes = async (
  isActive?: boolean
): Promise<OrgUnitType[]> => {
  const params =
    isActive === undefined
      ? undefined
      : { is_active: isActive ? 'true' : 'false' };

  const response = await apiClient.get<ApiResponse<OrgUnitType[]>>(
    '/org-unit-types',
    { params }
  );

  return response.data.data ?? [];
};

export const getOrgUnitTypeById = async (
  id: string
): Promise<OrgUnitType> => {
  const response = await apiClient.get<ApiResponse<OrgUnitType>>(
    `/org-unit-types/${id}`
  );

  return response.data.data;
};

export const createOrgUnitType = async (
  input: CreateOrgUnitTypeInput
): Promise<OrgUnitType> => {
  const response = await apiClient.post<ApiResponse<OrgUnitType>>(
    '/org-unit-types',
    input
  );

  return response.data.data;
};

export const updateOrgUnitType = async (
  id: string,
  input: UpdateOrgUnitTypeInput
): Promise<OrgUnitType> => {
  const response = await apiClient.put<ApiResponse<OrgUnitType>>(
    `/org-unit-types/${id}`,
    input
  );

  return response.data.data;
};

export const deleteOrgUnitType = async (
  id: string
): Promise<OrgUnitType> => {
  const response = await apiClient.delete<ApiResponse<OrgUnitType>>(
    `/org-unit-types/${id}`
  );

  return response.data.data;
};
