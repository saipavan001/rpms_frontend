export type OrgUnitType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateOrgUnitTypeInput = {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
};

export type UpdateOrgUnitTypeInput = {
  code?: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export type OrgUnitTypeFormValues = {
  code: string;
  name: string;
  description: string;
  is_active: boolean;
};
