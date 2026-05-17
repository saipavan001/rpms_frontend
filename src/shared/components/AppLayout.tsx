import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import SidebarNav from './SidebarNav';
import TopNavBar from './TopNavBar';

const employeeNavItems = [{ to: '/welcome', label: 'Home' }] as const;

const AppLayout = () => {
  const navigate = useNavigate();
  const {
    user,
    logout,
    canManageUsers,
    canManageRpmsSettings,
    isEmployeePortalUser,
    isResearcherEmployee,
  } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (isEmployeePortalUser) {
    return (
      <div className="app-shell">
        <TopNavBar
          user={user}
          subtitle="Employee portal"
          onLogout={handleLogout}
          navItems={employeeNavItems}
        />
        <main className="app-main-scroll">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopNavBar
        user={user}
        onLogout={handleLogout}
        showMenuButton
        menuOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen((open) => !open)}
      />

      {sidebarOpen && (
        <button
          type="button"
          className="app-drawer-backdrop"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={[
          'app-sidebar app-sidebar-fixed fixed bottom-0 left-0 z-50 flex flex-col shadow-xl transition-transform duration-200 lg:z-40 lg:translate-x-0 lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarNav
          canManageUsers={canManageUsers}
          canManageRpmsSettings={canManageRpmsSettings}
          isResearcherEmployee={isResearcherEmployee}
          onNavigate={closeSidebar}
        />
      </aside>

      <main className="app-main-scroll">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
