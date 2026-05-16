import { Link } from 'react-router-dom';

const DashboardPage = () => {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome to RPMS</h1>
        <p className="mt-2 text-sm text-slate-400 sm:text-base">
          Authentication successful. Use the navigation to manage modules.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <Link
          to="/org-unit-types"
          className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition-colors hover:bg-white/10 active:bg-white/15 sm:p-6"
        >
          <h2 className="text-lg font-semibold text-white">
            Organization Unit Types
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Create, update, and delete organization unit types.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
