export type OrganizationUnitRef = {
  id: string;
  code: string;
  name: string;
};

export type OrganizationUnit = {
  id: string;
  code: string;
  name: string;
  short_name: string | null;
  description: string | null;
  ou_type_id: string;
  parent_ou_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  ou_type: OrganizationUnitRef;
  parent_ou: OrganizationUnitRef | null;
};

export type CreateOrganizationUnitInput = {
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  ou_type_id: string;
  parent_ou_id?: string | null;
  is_active?: boolean;
};

export type UpdateOrganizationUnitInput = {
  code?: string;
  name?: string;
  short_name?: string | null;
  description?: string | null;
  ou_type_id?: string;
  parent_ou_id?: string | null;
  is_active?: boolean;
};

export type OrganizationUnitFormValues = {
  code: string;
  name: string;
  short_name: string;
  description: string;
  ou_type_id: string;
  parent_ou_id: string;
  is_active: boolean;
};
