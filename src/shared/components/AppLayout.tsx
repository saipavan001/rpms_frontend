import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { getPrimaryRoleLabel } from '../auth/permissions';
import { useAuth } from '../context/AuthContext';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ');

const erpNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/org-unit-types', label: 'Org Unit Types' },
  { to: '/org-unit-type-hierarchies', label: 'Type Hierarchy' },
  { to: '/organization-units', label: 'Organization Units' },
  { to: '/employees', label: 'Employees' },
] as const;

const employeeNavItems = [{ to: '/welcome', label: 'Home' }] as const;

const AppLayout = () => {
  const navigate = useNavigate();
  const { user, logout, canManageUsers, isEmployeePortalUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isEmployeePortalUser
    ? [...employeeNavItems]
    : canManageUsers
      ? [...erpNavItems, { to: '/users', label: 'Users' }]
      : [...erpNavItems];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 sm:h-10 sm:w-10">
              <span className="text-base font-bold text-white sm:text-lg">R</span>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-white sm:text-lg">
                RPMS
              </h1>
              <p className="hidden truncate text-xs text-slate-400 sm:block">
                {user ? getPrimaryRoleLabel(user.role_names) : 'RPMS'}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              Logout
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-200 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? (
              <span className="text-xl leading-none">✕</span>
            ) : (
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={navLinkClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
                className="mt-1 rounded-lg border border-white/10 px-4 py-2.5 text-left text-sm font-medium text-slate-300 hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
