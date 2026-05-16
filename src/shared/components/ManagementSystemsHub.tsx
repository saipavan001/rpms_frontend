import { Link } from 'react-router-dom';

import {
  MANAGEMENT_SYSTEMS,
  type ManagementSystem,
} from '../config/management-systems';

const systemAccent: Record<string, string> = {
  organization: 'border-violet-500/30 bg-violet-500/5',
  employee: 'border-emerald-500/30 bg-emerald-500/5',
  access: 'border-amber-500/30 bg-amber-500/5',
  project: 'border-sky-500/20 bg-sky-500/5',
  payroll: 'border-rose-500/20 bg-rose-500/5',
  leave: 'border-teal-500/20 bg-teal-500/5',
};

type ManagementSystemsHubProps = {
  canManageUsers: boolean;
};

const SystemCard = ({
  system,
  disabled,
}: {
  system: ManagementSystem;
  disabled: boolean;
}) => {
  const accent =
    systemAccent[system.id] ?? 'border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5';
  const isComingSoon = system.status === 'coming_soon';

  const inner = (
    <div
      className={`flex h-full flex-col rounded-2xl border p-5 transition-colors ${accent} ${
        disabled || isComingSoon
          ? 'opacity-75'
          : 'hover:border-blue-500/40 hover:bg-white/[0.07]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="app-card-title text-base">{system.shortName}</h3>
        {isComingSoon ? (
          <span className="shrink-0 rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Coming soon
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-300">
            Active
          </span>
        )}
      </div>
      <p className="mt-1 app-label text-xs font-medium">{system.name}</p>
      <p className="mt-2 flex-1 app-muted text-sm leading-relaxed">
        {system.description}
      </p>
      {!isComingSoon && system.homeRoute && (
        <p className="mt-4 text-sm font-medium text-blue-400">Open system →</p>
      )}
    </div>
  );

  if (disabled || isComingSoon || !system.homeRoute) {
    return inner;
  }

  return (
    <Link to={system.homeRoute} className="block h-full">
      {inner}
    </Link>
  );
};

const ManagementSystemsHub = ({ canManageUsers }: ManagementSystemsHubProps) => {
  const systems = MANAGEMENT_SYSTEMS.filter(
    (s) => !s.superAdminOnly || canManageUsers
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {systems.map((system) => (
        <SystemCard
          key={system.id}
          system={system}
          disabled={system.superAdminOnly === true && !canManageUsers}
        />
      ))}
    </div>
  );
};

export default ManagementSystemsHub;
