export const ROLE_CODES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  GUEST: 'GUEST',
  RESEARCH_ADMIN: 'RESEARCH_ADMIN',
  RESEARCHER: 'RESEARCHER',
  COMMITTEE_MEMBER: 'COMMITTEE_MEMBER',
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

/** Employee-only welcome portal (no RPMS, no admin ERP). */
export const isEmployeePortalUser = (roles: string[]) =>
  roles.includes(ROLE_CODES.EMPLOYEE) &&
  !canAccessErpModules(roles) &&
  !canAccessRpms(roles);

/** Linked employee with both EMPLOYEE and RESEARCHER (PI) roles. */
export const isResearcherEmployee = (user: AuthUser | null) =>
  Boolean(user?.employee_id) &&
  (user?.roles.includes(ROLE_CODES.EMPLOYEE) ?? false) &&
  (user?.roles.includes(ROLE_CODES.RESEARCHER) ?? false);

export const canAccessDashboard = (user: AuthUser | null) =>
  canAccessErpModules(user?.roles ?? []) || isResearcherEmployee(user);

export const canViewOwnEmployeeRecord = (user: AuthUser | null): boolean =>
  Boolean(
    user?.employee_id &&
      (user.roles.includes(ROLE_CODES.EMPLOYEE) ||
        user.roles.includes(ROLE_CODES.RESEARCHER))
  );

export const getHomePath = (user: AuthUser | null) => {
  const roles = user?.roles ?? [];
  if (isEmployeePortalUser(roles)) return '/welcome';
  if (isResearcherEmployee(user)) return '/dashboard';
  if (canAccessRpms(roles) && !canAccessErpModules(roles)) return '/rpms/projects';
  return '/dashboard';
};

export const canManageUsers = (roles: string[]) =>
  roles.includes(ROLE_CODES.SUPER_ADMIN);

const RPMS_ACCESS_ROLES: string[] = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.RESEARCH_ADMIN,
  ROLE_CODES.RESEARCHER,
  ROLE_CODES.COMMITTEE_MEMBER,
];

const RPMS_PROJECT_CREATOR_ROLES: string[] = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.RESEARCH_ADMIN,
  ROLE_CODES.RESEARCHER,
];

export const canAccessRpms = (roles: string[]) =>
  roles.some((r) => RPMS_ACCESS_ROLES.includes(r));

export const canManageRpmsSettings = (roles: string[]) =>
  roles.includes(ROLE_CODES.SUPER_ADMIN) ||
  roles.includes(ROLE_CODES.RESEARCH_ADMIN);

export const canCreateRpmsProjects = (roles: string[]) =>
  roles.some((r) => RPMS_PROJECT_CREATOR_ROLES.includes(r));

const RPMS_PI_ASSIGN_ROLES: string[] = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.RESEARCH_ADMIN,
];

export const canSelectProjectPi = (roles: string[]) =>
  roles.some((r) => RPMS_PI_ASSIGN_ROLES.includes(r));

const RPMS_COMMITTEE_REVIEW_ROLES: string[] = [
  ROLE_CODES.SUPER_ADMIN,
  ROLE_CODES.ADMIN,
  ROLE_CODES.RESEARCH_ADMIN,
  ROLE_CODES.COMMITTEE_MEMBER,
];

export const canReviewRpmsProposals = (roles: string[]) =>
  roles.some((r) => RPMS_COMMITTEE_REVIEW_ROLES.includes(r));

export const isProposalAwaitingCommitteeReview = (status: string) =>
  status === 'UNDER_COMMITTEE_REVIEW' || status === 'SUBMITTED_TO_COMMITTEE';

export const isSuperAdmin = (roles: string[]) =>
  roles.includes(ROLE_CODES.SUPER_ADMIN);

export const getPrimaryRoleLabel = (roleNames: string[]) =>
  roleNames.length > 0 ? roleNames.join(', ') : 'No role';
