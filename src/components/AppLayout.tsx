import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ');

const AppLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">RPMS</h1>
              <p className="text-xs text-slate-400">
                Research Project Management System
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/org-unit-types" className={navLinkClass}>
              Org Unit Types
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
