import type { OrgUnitType } from '../../org-unit-types/types/org-unit-type';

export type OrgUnitTypeRef = Pick<OrgUnitType, 'id' | 'code' | 'name'>;

export type OrgUnitTypeHierarchy = {
  id: string;
  parent_ou_type_id: string;
  child_ou_type_id: string;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent_ou_type: OrgUnitTypeRef;
  child_ou_type: OrgUnitTypeRef;
};

export type CreateOrgUnitTypeHierarchyInput = {
  parent_ou_type_id: string;
  child_ou_type_id: string;
  display_order?: number | null;
  is_active?: boolean;
};

export type UpdateOrgUnitTypeHierarchyInput = {
  parent_ou_type_id?: string;
  child_ou_type_id?: string;
  display_order?: number | null;
  is_active?: boolean;
};

export type OrgUnitTypeHierarchyFormValues = {
  parent_ou_type_id: string;
  child_ou_type_id: string;
  display_order: string;
  is_active: boolean;
};
