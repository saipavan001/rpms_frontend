import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type {
  CreateOrgUnitTypeHierarchyInput,
  OrgUnitTypeHierarchy,
  UpdateOrgUnitTypeHierarchyInput,
} from '../types/org-unit-type-hierarchy';

export const getOrgUnitTypeHierarchies = async (
  isActive?: boolean
): Promise<OrgUnitTypeHierarchy[]> => {
  const params =
    isActive === undefined
      ? undefined
      : { is_active: isActive ? 'true' : 'false' };

  const response = await apiClient.get<ApiResponse<OrgUnitTypeHierarchy[]>>(
    '/org-unit-type-hierarchies',
    { params }
  );

  return response.data.data;
};

export const getOrgUnitTypeHierarchyById = async (
  id: string
): Promise<OrgUnitTypeHierarchy> => {
  const response = await apiClient.get<ApiResponse<OrgUnitTypeHierarchy>>(
    `/org-unit-type-hierarchies/${id}`
  );

  return response.data.data;
};

export const createOrgUnitTypeHierarchy = async (
  input: CreateOrgUnitTypeHierarchyInput
): Promise<OrgUnitTypeHierarchy> => {
  const response = await apiClient.post<ApiResponse<OrgUnitTypeHierarchy>>(
    '/org-unit-type-hierarchies',
    input
  );

  return response.data.data;
};

export const updateOrgUnitTypeHierarchy = async (
  id: string,
  input: UpdateOrgUnitTypeHierarchyInput
): Promise<OrgUnitTypeHierarchy> => {
  const response = await apiClient.put<ApiResponse<OrgUnitTypeHierarchy>>(
    `/org-unit-type-hierarchies/${id}`,
    input
  );

  return response.data.data;
};

export const deleteOrgUnitTypeHierarchy = async (
  id: string
): Promise<OrgUnitTypeHierarchy> => {
  const response = await apiClient.delete<ApiResponse<OrgUnitTypeHierarchy>>(
    `/org-unit-type-hierarchies/${id}`
  );

  return response.data.data;
};
