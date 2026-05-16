import { useAuth } from '../../../shared/context/AuthContext';

const EmployeeWelcomePage = () => {
  const { user } = useAuth();

  const displayName =
    user?.employee?.employee_name ?? user?.username ?? 'Employee';

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl sm:p-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10">
          <span className="text-2xl font-bold text-blue-300">R</span>
        </div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome, {displayName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
          You are signed in to the Research Project Management System employee
          portal. Your workspace features will appear here as they are enabled.
        </p>
        {user?.employee && (
          <p className="mt-4 text-xs text-slate-500">
            Employee ID: {user.employee.employee_code}
          </p>
        )}
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-5 text-left text-sm text-slate-400">
          <p className="font-medium text-slate-300">What you can do now</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>View this welcome page after login</li>
            <li>Sign out when you are finished</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Org structure and employee management are not available on employee
            accounts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeWelcomePage;
