export type UserRoleRef = {
  id: string;
  code: string;
  name: string;
};

export type User = {
  id: string;
  username: string;
  employee_id: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    employee_code: string;
    employee_name: string;
    email_official: string;
  } | null;
  roles: UserRoleRef[];
};

export type Role = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type UserFormValues = {
  username: string;
  password: string;
  employee_id: string;
  role_codes: string[];
  is_active: boolean;
};

export type CreateUserInput = {
  username: string;
  password: string;
  employee_id?: string | null;
  role_codes?: string[];
  is_active?: boolean;
};

export type UpdateUserInput = {
  username?: string;
  password?: string;
  employee_id?: string | null;
  role_codes?: string[];
  is_active?: boolean;
};
