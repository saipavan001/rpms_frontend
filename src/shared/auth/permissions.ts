export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  GUEST: 'GUEST',
} as const;

export type AuthUser = {
  id: string;
  username: string;
  employee_id: string | null;
  is_active: boolean;
  employee?: {
    id: string;
    employee_code: string;
    employee_name: string;
  } | null;
  roles: string[];
  role_names: string[];
};

const READ_ROLES: string[] = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.GUEST,
];

const WRITE_ROLES: string[] = [ROLE_CODES.SUPER_ADMIN, ROLE_CODES.ADMIN];

export const canRead = (roles: string[]) =>
  roles.some((role) => READ_ROLES.includes(role));

export const canWrite = (roles: string[]) =>
  roles.some((role) => WRITE_ROLES.includes(role));

export const canAccessErpModules = (roles: string[]) => canRead(roles);

export const isEmployeePortalUser = (roles: string[]) =>
  roles.includes(ROLE_CODES.EMPLOYEE) && !canAccessErpModules(roles);

export const getHomePath = (roles: string[]) =>
  isEmployeePortalUser(roles) ? '/welcome' : '/dashboard';

export const canManageUsers = (roles: string[]) =>
  roles.includes(ROLE_CODES.SUPER_ADMIN);

export const isSuperAdmin = (roles: string[]) =>
  roles.includes(ROLE_CODES.SUPER_ADMIN);

export const getPrimaryRoleLabel = (roleNames: string[]) =>
  roleNames.length > 0 ? roleNames.join(', ') : 'No role';
