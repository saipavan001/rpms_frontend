import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../shared/context/AuthContext';
import { APP_NAME, APP_TAGLINE } from '../../../shared/config/brand';
import ManagementSystemsHub from '../../../shared/components/ManagementSystemsHub';
import EmployeeProfileDetail from '../../employees/components/EmployeeProfileDetail';
import { getEmployees, getMyEmployee } from '../../employees/services/employee.service';
import type { Employee } from '../../employees/types/employee';
import { getOrgUnitTypeHierarchies } from '../../org-unit-type-hierarchies/services/org-unit-type-hierarchy.service';
import { getOrgUnitTypes } from '../../org-unit-types/services/org-unit-type.service';
import { getOrganizationUnits } from '../../organization-units/services/organization-unit.service';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

type SetupStats = {
  orgUnitTypes: number;
  activeOrgUnitTypes: number;
  hierarchies: number;
  organizationUnits: number;
  employees: number;
};

type StepStatus = 'locked' | 'ready' | 'complete';

type SetupStep = {
  step: number;
  title: string;
  description: string;
  tasks: string[];
  to: string;
  actionLabel: string;
  getStatus: (stats: SetupStats) => StepStatus;
};

const setupSteps: SetupStep[] = [
  {
    step: 1,
    title: 'Create organization unit types',
    description:
      'Define the kinds of units in your organization (for example: Company, Division, Department).',
    tasks: [
      'Add at least two unit types',
      'Keep types active if you plan to use them in hierarchies',
      'Use clear codes (e.g. COMPANY, DEPT) for easy reference later',
    ],
    to: '/org-unit-types',
    actionLabel: 'Manage unit types',
    getStatus: (stats) =>
      stats.orgUnitTypes >= 2 ? 'complete' : stats.orgUnitTypes > 0 ? 'ready' : 'ready',
  },
  {
    step: 2,
    title: 'Define type hierarchy',
    description:
      'Specify which unit types can be parents of other types (e.g. Company → Department).',
    tasks: [
      'Requires at least two unit types from step 1',
      'Add parent → child relationships between types',
      'Set display order when multiple child types exist',
    ],
    to: '/org-unit-type-hierarchies',
    actionLabel: 'Manage type hierarchy',
    getStatus: (stats) => {
      if (stats.hierarchies > 0) return 'complete';
      if (stats.orgUnitTypes < 2) return 'locked';
      return 'ready';
    },
  },
  {
    step: 3,
    title: 'Create organization units',
    description:
      'Build your actual org structure using the types and hierarchy you defined.',
    tasks: [
      'Create units and assign each a unit type',
      'Optionally set a parent unit for nested structure',
      'Ensure units are active before assigning employees',
    ],
    to: '/organization-units',
    actionLabel: 'Manage organization units',
    getStatus: (stats) => {
      if (stats.organizationUnits > 0) return 'complete';
      if (stats.orgUnitTypes < 1) return 'locked';
      return 'ready';
    },
  },
  {
    step: 4,
    title: 'Add employees',
    description:
      'Register employees and link each one to an organization unit.',
    tasks: [
      'Requires at least one organization unit from step 3',
      'Add employees individually or use CSV bulk upload',
      'Use official email and employee code — both must be unique',
    ],
    to: '/employees',
    actionLabel: 'Manage employees',
    getStatus: (stats) => {
      if (stats.employees > 0) return 'complete';
      if (stats.organizationUnits < 1) return 'locked';
      return 'ready';
    },
  },
];

const statusStyles: Record<
  StepStatus,
  { badge: string; ring: string; label: string }
> = {
  locked: {
    badge: 'bg-slate-500/15 text-slate-400',
    ring: 'border-white/10 bg-white/5',
    label: 'Waiting',
  },
  ready: {
    badge: 'bg-blue-500/15 text-blue-300',
    ring: 'border-blue-500/30 bg-blue-500/5',
    label: 'Action needed',
  },
  complete: {
    badge: 'bg-emerald-500/15 text-emerald-300',
    ring: 'border-emerald-500/30 bg-emerald-500/5',
    label: 'Done',
  },
};

const DashboardPage = () => {
  const { canManageUsers, isResearcherEmployee, user } = useAuth();
  const [stats, setStats] = useState<SetupStats | null>(null);
  const [myEmployee, setMyEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError('');

        if (isResearcherEmployee) {
          const employee = await getMyEmployee();
          setMyEmployee(employee);
          return;
        }

        const [types, hierarchies, units, employees] = await Promise.all([
          getOrgUnitTypes(),
          getOrgUnitTypeHierarchies(),
          getOrganizationUnits(),
          getEmployees(),
        ]);

        setStats({
          orgUnitTypes: types.length,
          activeOrgUnitTypes: types.filter((t) => t.is_active).length,
          hierarchies: hierarchies.length,
          organizationUnits: units.length,
          employees: employees.length,
        });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isResearcherEmployee]);

  const completedSteps = stats
    ? setupSteps.filter((s) => s.getStatus(stats) === 'complete').length
    : 0;

  if (isResearcherEmployee) {
    const displayName =
      myEmployee?.employee_name ?? user?.employee?.employee_name ?? user?.username;

    return (
      <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
            {APP_NAME}
          </p>
          <h1 className="mt-1 app-page-title">Welcome, {displayName}</h1>
          <p className="mt-2 max-w-2xl app-muted text-sm sm:text-base">
            Your employee profile and research proposals. Use RPMS to create and
            submit project proposals for committee approval.
          </p>
        </div>

        {error && (
          <div role="alert" className="app-alert-warning">
            {error}
          </div>
        )}

        {loading ? (
          <p className="app-card p-8 text-center text-slate-500">Loading…</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-emerald-400">
                Employee Management System
              </p>
              {myEmployee ? (
                <EmployeeProfileDetail employee={myEmployee} />
              ) : (
                <p className="app-card p-6 text-sm text-slate-500">
                  No employee record found.
                </p>
              )}
              <Link
                to="/my-employee"
                className="mt-3 inline-block text-sm font-medium text-blue-400 hover:underline"
              >
                View full employee record →
              </Link>
            </div>
            <div>
              <p className="mb-3 text-sm font-medium uppercase tracking-wide text-sky-400">
                Research Project Management System
              </p>
              <ManagementSystemsHub
                canManageUsers={false}
                isResearcherEmployee
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 sm:space-y-10">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-400">
          {APP_NAME}
        </p>
        <h1 className="mt-1 app-page-title">
          Management systems
        </h1>
        <p className="mt-2 max-w-2xl app-muted text-sm sm:text-base">
          {APP_TAGLINE}. Open an active system below or follow the organization
          setup guide when you are getting started.
        </p>
      </div>

      <ManagementSystemsHub canManageUsers={canManageUsers} />

      <div className="app-divider border-t pt-8">
        <p className="text-sm font-medium uppercase tracking-wide text-violet-400">
          Organization Management System
        </p>
        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
          Setup guide
        </h2>
        <p className="mt-2 max-w-2xl app-muted text-sm sm:text-base">
          Complete these steps in order to configure your organization structure
          and employee records. Each step unlocks the next.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="app-alert-warning"
        >
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Unit types', value: stats?.orgUnitTypes },
          { label: 'Type hierarchies', value: stats?.hierarchies },
          { label: 'Organization units', value: stats?.organizationUnits },
          { label: 'Employees', value: stats?.employees },
        ].map((item) => (
          <div
            key={item.label}
            className="app-stat-tile"
          >
            <p className="app-muted text-xs">{item.label}</p>
            <p className="mt-1 app-brand-title text-2xl">
              {loading ? '—' : (item.value ?? 0)}
            </p>
          </div>
        ))}
      </div>

      {!loading && stats && (
        <div className="app-stat-tile">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-300">Overall progress</span>
            <span className="font-medium text-white">
              {completedSteps} / {setupSteps.length} steps complete
            </span>
          </div>
          <div className="app-progress-track">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${(completedSteps / setupSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {setupSteps.map((step, index) => {
          const status = stats ? step.getStatus(stats) : 'ready';
          const styles = statusStyles[status];
          const isLast = index === setupSteps.length - 1;

          return (
            <div key={step.step} className="relative flex gap-4">
              {!isLast && (
                <div
                  className="absolute left-5 top-12 hidden h-[calc(100%-0.5rem)] w-px bg-white/10 sm:block"
                  aria-hidden
                />
              )}

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold sm:h-11 sm:w-11 ${styles.ring} ${
                  status === 'complete'
                    ? 'text-emerald-300'
                    : status === 'locked'
                      ? 'text-slate-500'
                      : 'text-blue-300'
                }`}
              >
                {status === 'complete' ? '✓' : step.step}
              </div>

              <div
                className={`min-w-0 flex-1 rounded-2xl border p-4 sm:p-5 ${styles.ring}`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="app-card-title text-base sm:text-lg">
                        {step.title}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles.badge}`}
                      >
                        {styles.label}
                      </span>
                    </div>
                    <p className="mt-1 app-muted text-sm">
                      {step.description}
                    </p>
                  </div>

                  <Link
                    to={step.to}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                      status === 'locked'
                        ? 'pointer-events-none border border-white/5 bg-white/5 text-slate-500'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    aria-disabled={status === 'locked'}
                    onClick={(e) => {
                      if (status === 'locked') e.preventDefault();
                    }}
                  >
                    {step.actionLabel}
                  </Link>
                </div>

                <ul className="mt-4 space-y-2 app-divider border-t pt-4">
                  {step.tasks.map((task) => (
                    <li
                      key={task}
                      className="flex gap-2 app-label text-sm"
                    >
                      <span className="text-slate-500" aria-hidden>
                        •
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>

                {stats && step.step === 1 && stats.orgUnitTypes > 0 && stats.orgUnitTypes < 2 && (
                  <p className="mt-3 text-xs text-amber-300">
                    You have {stats.orgUnitTypes} type — add at least one more to
                    continue to step 2.
                  </p>
                )}

                {stats &&
                  step.step === 1 &&
                  stats.orgUnitTypes >= 2 &&
                  stats.activeOrgUnitTypes < 2 && (
                    <p className="mt-3 text-xs text-amber-300">
                      {stats.orgUnitTypes} types exist but only{' '}
                      {stats.activeOrgUnitTypes} active — activate at least two for
                      hierarchy setup.
                    </p>
                  )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="app-dashed-panel p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-slate-200">Quick reference</h3>
        <p className="mt-2 app-muted text-sm">
          Recommended order:{' '}
          <span className="text-slate-300">
            Unit Types → Type Hierarchy → Organization Units → Employees
          </span>
          . Bulk employee import is available on the Employees page once
          organization units exist.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
