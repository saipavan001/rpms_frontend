import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '../../../shared/utils/api-error';
import EmployeeProfileDetail from '../components/EmployeeProfileDetail';
import { getMyEmployee } from '../services/employee.service';
import type { Employee } from '../types/employee';

const MyEmployeePage = () => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyEmployee();
      setEmployee(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load your employee record.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-slate-500 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 app-page-title">My employee record</h1>
        <p className="mt-1 app-muted text-sm">
          Your profile from the Employee Management System (read-only).
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <p className="app-card p-8 text-center text-slate-500">Loading…</p>
      ) : employee ? (
        <EmployeeProfileDetail employee={employee} />
      ) : null}
    </div>
  );
};

export default MyEmployeePage;
