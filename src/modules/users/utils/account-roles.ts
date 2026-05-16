import { ROLE_CODES } from '../../../shared/auth/permissions';
import type { Role } from '../types/user';

export const LINKED_EMPLOYEE_ROLE_CODES = [
  ROLE_CODES.ADMIN,
  ROLE_CODES.EMPLOYEE,
] as const;

export const ADMINISTRATIVE_ROLE_CODES = [
  ROLE_CODES.ADMIN,
  ROLE_CODES.GUEST,
] as const;

export const getAccountRolesForEmployee = (
  roles: Role[],
  employeeId: string
): Role[] => {
  const allowed = employeeId
    ? LINKED_EMPLOYEE_ROLE_CODES
    : ADMINISTRATIVE_ROLE_CODES;

  return roles.filter((role) =>
    (allowed as readonly string[]).includes(role.code)
  );
};

export const sanitizeRoleCodesForEmployee = (
  roleCodes: string[],
  employeeId: string
): string[] => {
  const allowed = employeeId
    ? LINKED_EMPLOYEE_ROLE_CODES
    : ADMINISTRATIVE_ROLE_CODES;

  return roleCodes.filter((code) =>
    (allowed as readonly string[]).includes(code)
  );
};

export const getAccountTypeLabel = (employeeId: string) =>
  employeeId ? 'Account type (employee user)' : 'Account type (administrative user)';
