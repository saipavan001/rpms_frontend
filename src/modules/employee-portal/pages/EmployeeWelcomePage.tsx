import { useAuth } from '../../../shared/context/AuthContext';
import { APP_MONOGRAM, APP_NAME, APP_TAGLINE } from '../../../shared/config/brand';

const EmployeeWelcomePage = () => {
  const { user } = useAuth();

  const displayName =
    user?.employee?.employee_name ?? user?.username ?? 'Employee';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="app-card rounded-2xl p-8 text-center shadow-xl sm:p-12">
        <div className="app-logo-box mx-auto mb-6 h-16 w-16 rounded-2xl border-blue-500/30 bg-blue-500/10">
          <span className="app-brand-title text-2xl text-blue-600 dark:text-blue-300">{APP_MONOGRAM}</span>
        </div>
        <h1 className="app-page-title">
          Welcome, {displayName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
          You are signed in to the {APP_NAME} employee portal ({APP_TAGLINE}).
          Your workspace features will appear here as they are enabled.
        </p>
        {user?.employee && (
          <p className="mt-4 app-muted text-xs">
            Employee ID: {user.employee.employee_code}
          </p>
        )}
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-5 text-left app-muted text-sm">
          <p className="font-medium text-slate-300">What you can do now</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>View this welcome page after login</li>
            <li>Sign out when you are finished</li>
          </ul>
          <p className="mt-3 app-muted text-xs">
            Org structure and employee management are not available on employee
            accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWelcomePage;
