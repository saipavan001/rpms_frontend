import { useEffect, useMemo, useState } from 'react';

import { ROLE_CODES } from '../../../shared/auth/permissions';
import type { Employee } from '../../employees/types/employee';
import type { Role, UserFormValues } from '../types/user';
import {
  getAccountRolesForEmployee,
  getAccountTypeLabel,
  sanitizeRoleCodesForEmployee,
} from '../utils/account-roles';

type UserModalProps = {
  title: string;
  initialValues?: UserFormValues;
  submitLabel: string;
  loading?: boolean;
  roles: Role[];
  employees: Employee[];
  isEdit?: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

const emptyValues: UserFormValues = {
  username: '',
  password: '',
  employee_id: '',
  role_codes: [],
  is_active: true,
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm';

const getRoleDisplayName = (role: Role, hasEmployee: boolean) => {
  if (hasEmployee && role.code === ROLE_CODES.ADMIN) {
    return 'Administrator';
  }
  if (hasEmployee && role.code === ROLE_CODES.EMPLOYEE) {
    return 'Employee account (welcome portal only)';
  }
  if (!hasEmployee && role.code === ROLE_CODES.ADMIN) {
    return 'Administrator';
  }
  if (!hasEmployee && role.code === ROLE_CODES.GUEST) {
    return 'Guest (read-only)';
  }
  return role.name;
};

const UserModal = ({
  title,
  initialValues,
  submitLabel,
  loading = false,
  roles,
  employees,
  isEdit = false,
  onClose,
  onSubmit,
}: UserModalProps) => {
  const [values, setValues] = useState<UserFormValues>(
    initialValues ?? emptyValues
  );

  useEffect(() => {
    setValues(initialValues ?? emptyValues);
  }, [initialValues]);

  const hasEmployee = Boolean(values.employee_id);

  const availableRoles = useMemo(
    () => getAccountRolesForEmployee(roles, values.employee_id),
    [roles, values.employee_id]
  );

  const handleEmployeeChange = (employeeId: string) => {
    setValues((prev) => ({
      ...prev,
      employee_id: employeeId,
      role_codes: sanitizeRoleCodesForEmployee(prev.role_codes, employeeId),
    }));
  };

  const selectRole = (code: string) => {
    setValues((prev) => ({ ...prev, role_codes: [code] }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-white/10 bg-slate-900 shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <h2 className="pr-4 text-lg font-semibold text-white sm:text-xl">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="text-slate-400">
            X
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-200">
                Username
              </label>
              <input
                type="text"
                value={values.username}
                onChange={(e) =>
                  setValues((p) => ({ ...p, username: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-200">
                Password {isEdit && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={values.password}
                onChange={(e) =>
                  setValues((p) => ({ ...p, password: e.target.value }))
                }
                className={inputClass}
                required={!isEdit}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-200">
                Link to employee
              </label>
              <select
                value={values.employee_id}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                className={inputClass}
              >
                <option value="" className="bg-slate-900">
                  None — administrative user
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id} className="bg-slate-900">
                    {emp.employee_code} — {emp.employee_name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {hasEmployee
                  ? 'Choose Administrator or Employee account. Guest is not available for linked employees.'
                  : 'Without an employee link, choose Administrator or Guest (read-only).'}
              </p>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-slate-200">
                {getAccountTypeLabel(values.employee_id)}
              </span>
              <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                {availableRoles.length === 0 && (
                  <p className="text-sm text-amber-300">
                    No account types available. Run{' '}
                    <code className="rounded bg-black/30 px-1">npm run seed</code>{' '}
                    on the backend.
                  </p>
                )}
                {availableRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-start gap-3 text-sm text-slate-200"
                  >
                    <input
                      type="radio"
                      name="account_type"
                      checked={values.role_codes[0] === role.code}
                      onChange={() => selectRole(role.code)}
                      className="mt-0.5 h-4 w-4"
                    />
                    <div>
                      <span className="font-medium">
                        {getRoleDisplayName(role, hasEmployee)}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {role.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) =>
                  setValues((p) => ({ ...p, is_active: e.target.checked }))
                }
              />
              Active
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || values.role_codes.length === 0}
              className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
