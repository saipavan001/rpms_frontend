export type ManagementSystemStatus = 'active' | 'coming_soon';

export type NavItem = {
  to: string;
  label: string;
  /** Shown only for Research Admin / Super Admin */
  rpmsSettingsOnly?: boolean;
};

export type ManagementSystem = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  status: ManagementSystemStatus;
  /** Primary route when opening this system from the hub */
  homeRoute?: string;
  navItems?: NavItem[];
  /** PI / employee self-service (linked employee + researcher) */
  selfServiceNavItems?: NavItem[];
  selfServiceHomeRoute?: string;
  /** Only shown when user can manage users (Super Admin) */
  superAdminOnly?: boolean;
};

export const MANAGEMENT_SYSTEMS: ManagementSystem[] = [
  {
    id: 'organization',
    name: 'Organization Management System',
    shortName: 'Organization',
    description:
      'Define unit types, hierarchies, and your live organization structure.',
    status: 'active',
    homeRoute: '/org-unit-types',
    navItems: [
      { to: '/org-unit-types', label: 'Org unit types' },
      { to: '/org-unit-type-hierarchies', label: 'Type hierarchy' },
      { to: '/organization-units', label: 'Organization units' },
    ],
  },
  {
    id: 'employee',
    name: 'Employee Management System',
    shortName: 'Employees',
    description: 'Register staff, assign units, and maintain employee records.',
    status: 'active',
    homeRoute: '/employees',
    selfServiceHomeRoute: '/my-employee',
    navItems: [{ to: '/employees', label: 'Employees' }],
    selfServiceNavItems: [{ to: '/my-employee', label: 'My details' }],
  },
  {
    id: 'access',
    name: 'User & Access Management System',
    shortName: 'Users & access',
    description: 'Accounts, roles, and audit trail for platform administrators.',
    status: 'active',
    homeRoute: '/users',
    superAdminOnly: true,
    navItems: [
      { to: '/users', label: 'Users' },
      { to: '/audit-logs', label: 'Audit log' },
    ],
  },
  {
    id: 'project',
    name: 'Research Project Management System',
    shortName: 'RPMS',
    description:
      'Research proposals, ethics clearances, optional budgets, and OU committee approval.',
    status: 'active',
    homeRoute: '/rpms/projects',
    navItems: [
      { to: '/rpms/projects', label: 'Proposals' },
      { to: '/rpms/projects/new', label: 'New proposal' },
      {
        to: '/rpms/settings',
        label: 'Approval committees',
        rpmsSettingsOnly: true,
      },
      {
        to: '/rpms/settings/masters',
        label: 'Funding & budget masters',
        rpmsSettingsOnly: true,
      },
    ],
  },
  {
    id: 'payroll',
    name: 'Payroll Management System',
    shortName: 'Payroll',
    description: 'Compensation, payslips, and payroll processing.',
    status: 'coming_soon',
  },
  {
    id: 'leave',
    name: 'Leave Management System',
    shortName: 'Leave',
    description: 'Leave types, balances, requests, and approvals.',
    status: 'coming_soon',
  },
];

export const PLATFORM_NAV: NavItem[] = [{ to: '/dashboard', label: 'Dashboard' }];

const RESEARCHER_EMPLOYEE_SYSTEM_IDS = new Set(['employee', 'project']);

export const getActiveManagementSystems = (
  canManageUsers: boolean,
  isResearcherEmployee = false
) =>
  MANAGEMENT_SYSTEMS.filter((system) => {
    if (system.status !== 'active') return false;
    if (isResearcherEmployee) {
      return RESEARCHER_EMPLOYEE_SYSTEM_IDS.has(system.id);
    }
    return !system.superAdminOnly || canManageUsers;
  });

export const getSidebarNavGroups = (
  canManageUsers: boolean,
  canManageRpmsSettings = false,
  isResearcherEmployee = false
) => {
  const groups: { system: ManagementSystem; items: NavItem[] }[] = [];

  for (const system of getActiveManagementSystems(
    canManageUsers,
    isResearcherEmployee
  )) {
    const baseItems = isResearcherEmployee
      ? (system.selfServiceNavItems ?? system.navItems)
      : system.navItems;

    if (!baseItems?.length) continue;

    const items = baseItems.filter(
      (item) => !item.rpmsSettingsOnly || canManageRpmsSettings
    );
    if (items.length) {
      groups.push({ system, items });
    }
  }

  return groups;
};

export const getSystemHomeRoute = (
  system: ManagementSystem,
  isResearcherEmployee: boolean
) =>
  isResearcherEmployee && system.selfServiceHomeRoute
    ? system.selfServiceHomeRoute
    : system.homeRoute;
