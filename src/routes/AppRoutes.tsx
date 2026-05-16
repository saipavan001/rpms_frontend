import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import AppLayout from '../shared/components/AppLayout';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import RoleRoute from '../shared/components/RoleRoute';
import {
  canAccessErpModules,
  canManageUsers,
  isEmployeePortalUser,
} from '../shared/auth/permissions';
import LoginPage from '../modules/auth/pages/LoginPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import OrgUnitTypesPage from '../modules/org-unit-types/pages/OrgUnitTypesPage';
import OrgUnitTypeHierarchiesPage from '../modules/org-unit-type-hierarchies/pages/OrgUnitTypeHierarchiesPage';
import OrganizationUnitsPage from '../modules/organization-units/pages/OrganizationUnitsPage';
import EmployeesPage from '../modules/employees/pages/EmployeesPage';
import UsersPage from '../modules/users/pages/UsersPage';
import EmployeeWelcomePage from '../modules/employee-portal/pages/EmployeeWelcomePage';
import AuditLogsPage from '../modules/audit-logs/pages/AuditLogsPage';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/welcome"
            element={
              <RoleRoute allow={isEmployeePortalUser} redirectTo="/dashboard">
                <EmployeeWelcomePage />
              </RoleRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RoleRoute allow={canAccessErpModules} redirectTo="/welcome">
                <DashboardPage />
              </RoleRoute>
            }
          />
          <Route
            path="/org-unit-types"
            element={
              <RoleRoute allow={canAccessErpModules} redirectTo="/welcome">
                <OrgUnitTypesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/org-unit-type-hierarchies"
            element={
              <RoleRoute allow={canAccessErpModules} redirectTo="/welcome">
                <OrgUnitTypeHierarchiesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/organization-units"
            element={
              <RoleRoute allow={canAccessErpModules} redirectTo="/welcome">
                <OrganizationUnitsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <RoleRoute allow={canAccessErpModules} redirectTo="/welcome">
                <EmployeesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleRoute allow={canManageUsers}>
                <UsersPage />
              </RoleRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <RoleRoute allow={canManageUsers}>
                <AuditLogsPage />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
