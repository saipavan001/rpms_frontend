export type ManagementSystemStatus = 'active' | 'coming_soon';

export type NavItem = {
  to: string;
  label: string;
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
    navItems: [{ to: '/employees', label: 'Employees' }],
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
    name: 'Project Management System',
    shortName: 'Projects',
    description: 'Plan, track, and deliver work across teams.',
    status: 'coming_soon',
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

export const getActiveManagementSystems = (canManageUsers: boolean) =>
  MANAGEMENT_SYSTEMS.filter(
    (system) =>
      system.status === 'active' &&
      (!system.superAdminOnly || canManageUsers)
  );

export const getSidebarNavGroups = (canManageUsers: boolean) => {
  const groups: { system: ManagementSystem; items: NavItem[] }[] = [];

  for (const system of getActiveManagementSystems(canManageUsers)) {
    if (system.navItems?.length) {
      groups.push({ system, items: system.navItems });
    }
  }

  return groups;
};
