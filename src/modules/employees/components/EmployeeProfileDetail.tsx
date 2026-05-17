import type { Employee } from '../types/employee';

type EmployeeProfileDetailProps = {
  employee: Employee;
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="border-b border-slate-200 py-3 last:border-0 dark:border-white/10">
    <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </dt>
    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{value}</dd>
  </div>
);

const EmployeeProfileDetail = ({ employee }: EmployeeProfileDetailProps) => {
  const formatDate = (value: string | null) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  };

  return (
    <div className="app-card overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-white/10 dark:bg-white/5">
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {employee.employee_code}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
          {employee.employee_name}
        </h2>
        <span
          className={
            employee.is_active
              ? 'mt-2 inline-block rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-300'
              : 'mt-2 inline-block rounded-full bg-slate-500/15 px-2.5 py-0.5 text-xs font-medium text-slate-500'
          }
        >
          {employee.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <dl className="px-6">
        <DetailRow label="Official email" value={employee.email_official} />
        <DetailRow
          label="Personal email"
          value={employee.email_personal ?? '—'}
        />
        <DetailRow label="Phone" value={employee.phone_number ?? '—'} />
        <DetailRow label="Employment type" value={employee.employment_type} />
        <DetailRow label="Joining date" value={formatDate(employee.joining_date)} />
        <DetailRow
          label="Organization unit"
          value={`${employee.organization_unit.name} (${employee.organization_unit.code})`}
        />
      </dl>
    </div>
  );
};

export default EmployeeProfileDetail;
