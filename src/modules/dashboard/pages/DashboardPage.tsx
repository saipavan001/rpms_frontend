import { Link } from 'react-router-dom';

const modules = [
  {
    to: '/org-unit-types',
    title: 'Organization Unit Types',
    description: 'Create, update, and delete organization unit types.',
  },
  {
    to: '/org-unit-type-hierarchies',
    title: 'Org Unit Type Hierarchy',
    description: 'Define parent–child relationships between unit types.',
  },
  {
    to: '/organization-units',
    title: 'Organization Units',
    description: 'Manage departments, divisions, and other organizational units.',
  },
  {
    to: '/employees',
    title: 'Employees',
    description: 'Manage employees and bulk upload from CSV.',
  },
] as const;

const DashboardPage = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome to RPMS</h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Authentication successful. Use the navigation to manage modules.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.to}
            to={module.to}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:bg-white/10 active:bg-white/15 sm:p-6"
          >
            <h2 className="text-lg font-semibold text-white">{module.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{module.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
