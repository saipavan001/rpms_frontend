import { NavLink } from 'react-router-dom';

import { APP_MONOGRAM, APP_NAME, APP_TAGLINE } from '../config/brand';
import { getPrimaryRoleLabel } from '../auth/permissions';
import type { AuthUser } from '../auth/permissions';
import { headerNavLinkClass } from '../theme/classes';
import ThemeToggle from './ThemeToggle';

type TopNavItem = { to: string; label: string };

type TopNavBarProps = {
  user: AuthUser | null;
  subtitle?: string;
  onLogout: () => void;
  showMenuButton?: boolean;
  menuOpen?: boolean;
  onMenuToggle?: () => void;
  navItems?: readonly TopNavItem[];
};

const TopNavBar = ({
  user,
  subtitle,
  onLogout,
  showMenuButton = false,
  menuOpen = false,
  onMenuToggle,
  navItems = [],
}: TopNavBarProps) => {
  const roleLabel = user ? getPrimaryRoleLabel(user.role_names) : null;
  const displaySubtitle = subtitle ?? (user ? roleLabel : APP_TAGLINE);

  return (
    <header className="app-topbar fixed inset-x-0 top-0 z-50">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {showMenuButton && onMenuToggle && (
            <button
              type="button"
              onClick={onMenuToggle}
              className="app-btn-icon inline-flex h-10 w-10 shrink-0 lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            >
              {menuOpen ? (
                <span className="text-xl leading-none">×</span>
              ) : (
                <span className="flex flex-col gap-1" aria-hidden>
                  <span className="block h-0.5 w-5 rounded bg-current" />
                  <span className="block h-0.5 w-5 rounded bg-current" />
                  <span className="block h-0.5 w-5 rounded bg-current" />
                </span>
              )}
            </button>
          )}

          <div className="app-logo-box flex h-10 w-10 shrink-0 items-center justify-center">
            <span className="app-logo-letter text-lg">{APP_MONOGRAM}</span>
          </div>

          <div className="min-w-0">
            <h1 className="app-brand-title truncate text-base leading-tight sm:text-lg">
              {APP_NAME}
            </h1>
            {displaySubtitle && (
              <p className="hidden truncate app-muted text-xs sm:block">
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {navItems.length > 0 && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={headerNavLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {roleLabel && (
            <span className="app-topbar-role hidden rounded-lg px-2.5 py-1 text-xs font-medium lg:inline">
              {roleLabel}
            </span>
          )}
          <ThemeToggle />
          <button
            type="button"
            onClick={onLogout}
            className="app-btn-ghost hidden px-3 py-2 text-sm sm:inline-flex"
          >
            Logout
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="app-btn-icon inline-flex h-10 w-10 shrink-0 sm:hidden"
            aria-label="Logout"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
