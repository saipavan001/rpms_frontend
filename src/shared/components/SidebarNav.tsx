import { NavLink } from 'react-router-dom';

import { PLATFORM_NAV, getSidebarNavGroups } from '../config/management-systems';
import { sidebarNavLinkClass } from '../theme/classes';

type SidebarNavProps = {
  canManageUsers: boolean;
  canManageRpmsSettings?: boolean;
  isResearcherEmployee?: boolean;
  onNavigate?: () => void;
};

const SidebarNav = ({
  canManageUsers,
  canManageRpmsSettings = false,
  isResearcherEmployee = false,
  onNavigate,
}: SidebarNavProps) => {
  const groups = getSidebarNavGroups(
    canManageUsers,
    canManageRpmsSettings,
    isResearcherEmployee
  );

  return (
    <nav className="flex h-full min-h-0 flex-col">
      <div className="app-sidebar-brand shrink-0 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider app-nav-section">
          Navigation
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
        <div className="space-y-5">
          <div>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider app-nav-section">
              Platform
            </p>
            <div className="space-y-0.5">
              {PLATFORM_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={sidebarNavLinkClass}
                  onClick={onNavigate}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {groups.map(({ system, items }) => (
            <div key={system.id}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider app-nav-section">
                {system.shortName}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={sidebarNavLinkClass}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SidebarNav;
