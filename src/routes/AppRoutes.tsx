import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import AppLayout from '../shared/components/AppLayout';
import ProtectedRoute from '../shared/components/ProtectedRoute';
import LoginPage from '../modules/auth/pages/LoginPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import OrgUnitTypesPage from '../modules/org-unit-types/pages/OrgUnitTypesPage';
import OrgUnitTypeHierarchiesPage from '../modules/org-unit-type-hierarchies/pages/OrgUnitTypeHierarchiesPage';
import OrganizationUnitsPage from '../modules/organization-units/pages/OrganizationUnitsPage';
import EmployeesPage from '../modules/employees/pages/EmployeesPage';

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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/org-unit-types" element={<OrgUnitTypesPage />} />
          <Route
            path="/org-unit-type-hierarchies"
            element={<OrgUnitTypeHierarchiesPage />}
          />
          <Route path="/organization-units" element={<OrganizationUnitsPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
