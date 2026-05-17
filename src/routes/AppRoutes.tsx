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

  canAccessDashboard,

  canAccessErpModules,

  canAccessRpms,

  canManageRpmsSettings,

  canReviewRpmsProposals,

  canManageUsers,

  canViewOwnEmployeeRecord,

  isEmployeePortalUser,

} from '../shared/auth/permissions';

import ProjectsPage from '../modules/rpms/pages/ProjectsPage';

import ProjectWizardPage from '../modules/rpms/pages/ProjectWizardPage';
import ProjectReviewPage from '../modules/rpms/pages/ProjectReviewPage';

import RpmsSettingsPage from '../modules/rpms/pages/RpmsSettingsPage';
import RpmsMastersPage from '../modules/rpms/pages/RpmsMastersPage';

import LoginPage from '../modules/auth/pages/LoginPage';

import DashboardPage from '../modules/dashboard/pages/DashboardPage';

import OrgUnitTypesPage from '../modules/org-unit-types/pages/OrgUnitTypesPage';

import OrgUnitTypeHierarchiesPage from '../modules/org-unit-type-hierarchies/pages/OrgUnitTypeHierarchiesPage';

import OrganizationUnitsPage from '../modules/organization-units/pages/OrganizationUnitsPage';

import EmployeesPage from '../modules/employees/pages/EmployeesPage';

import MyEmployeePage from '../modules/employees/pages/MyEmployeePage';

import UsersPage from '../modules/users/pages/UsersPage';

import UserRoleAssignmentsPage from '../modules/users/pages/UserRoleAssignmentsPage';

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

              <RoleRoute allow={(u) => isEmployeePortalUser(u.roles)} redirectTo="/dashboard">

                <EmployeeWelcomePage />

              </RoleRoute>

            }

          />

          <Route

            path="/dashboard"

            element={

              <RoleRoute allow={canAccessDashboard} redirectTo="/welcome">

                <DashboardPage />

              </RoleRoute>

            }

          />

          <Route

            path="/my-employee"

            element={

              <RoleRoute allow={canViewOwnEmployeeRecord} redirectTo="/welcome">

                <MyEmployeePage />

              </RoleRoute>

            }

          />

          <Route

            path="/org-unit-types"

            element={

              <RoleRoute allow={(u) => canAccessErpModules(u.roles)} redirectTo="/welcome">

                <OrgUnitTypesPage />

              </RoleRoute>

            }

          />

          <Route

            path="/org-unit-type-hierarchies"

            element={

              <RoleRoute allow={(u) => canAccessErpModules(u.roles)} redirectTo="/welcome">

                <OrgUnitTypeHierarchiesPage />

              </RoleRoute>

            }

          />

          <Route

            path="/organization-units"

            element={

              <RoleRoute allow={(u) => canAccessErpModules(u.roles)} redirectTo="/welcome">

                <OrganizationUnitsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/employees"

            element={

              <RoleRoute allow={(u) => canAccessErpModules(u.roles)} redirectTo="/welcome">

                <EmployeesPage />

              </RoleRoute>

            }

          />

          <Route

            path="/users"

            element={

              <RoleRoute allow={(u) => canManageUsers(u.roles)}>

                <UsersPage />

              </RoleRoute>

            }

          />

          <Route

            path="/users/role-assignments"

            element={

              <RoleRoute allow={(u) => canManageUsers(u.roles)}>

                <UserRoleAssignmentsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/audit-logs"

            element={

              <RoleRoute allow={(u) => canManageUsers(u.roles)}>

                <AuditLogsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/projects"

            element={

              <RoleRoute allow={(u) => canAccessRpms(u.roles)} redirectTo="/welcome">

                <ProjectsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/projects/new"

            element={

              <RoleRoute allow={(u) => canAccessRpms(u.roles)} redirectTo="/welcome">

                <ProjectsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/projects/:id/edit"

            element={

              <RoleRoute allow={(u) => canAccessRpms(u.roles)} redirectTo="/welcome">

                <ProjectWizardPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/projects/:id/review"

            element={

              <RoleRoute allow={(u) => canReviewRpmsProposals(u.roles)} redirectTo="/welcome">

                <ProjectReviewPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/settings"

            element={

              <RoleRoute

                allow={(u) => canManageRpmsSettings(u.roles)}

                redirectTo="/dashboard"

              >

                <RpmsSettingsPage />

              </RoleRoute>

            }

          />

          <Route

            path="/rpms/settings/masters"

            element={

              <RoleRoute

                allow={(u) => canManageRpmsSettings(u.roles)}

                redirectTo="/dashboard"

              >

                <RpmsMastersPage />

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


