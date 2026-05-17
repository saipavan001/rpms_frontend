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
  'app-input';

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

  const toggleRole = (code: string) => {
    setValues((prev) => {
      const has = prev.role_codes.includes(code);
      if (has) {
        return { ...prev, role_codes: prev.role_codes.filter((c) => c !== code) };
      }
      if (code === ROLE_CODES.GUEST) {
        return { ...prev, role_codes: [code] };
      }
      return {
        ...prev,
        role_codes: [...prev.role_codes.filter((c) => c !== ROLE_CODES.GUEST), code],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <div className="app-modal-overlay">
      <div className="app-modal-panel">
        <div className="flex shrink-0 items-center justify-between app-sidebar-brand border-b px-4 py-4 sm:px-6">
          <h2 className="pr-4 app-heading text-lg sm:text-xl">
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
              <label className="mb-2 block app-label text-sm">
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
              <label className="mb-2 block app-label text-sm">
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
              <label className="mb-2 block app-label text-sm">
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
              <p className="mt-1 app-muted text-xs">
                {hasEmployee
                  ? 'You can assign multiple roles (e.g. Employee + Researcher). Guest is not available.'
                  : 'Administrative login. Guest cannot be combined with other roles.'}
              </p>
            </div>

            {isEdit ? (
              <div>
                <span className="mb-2 block app-label text-sm font-medium">
                  {getAccountTypeLabel(values.employee_id)}
                </span>
                <div className="app-card space-y-2 p-3">
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
                        type="checkbox"
                        checked={values.role_codes.includes(role.code)}
                        onChange={() => toggleRole(role.code)}
                        className="mt-0.5 h-4 w-4"
                      />
                      <div>
                        <span className="font-medium">
                          {getRoleDisplayName(role, hasEmployee)}
                        </span>
                        <span className="block app-muted text-xs">
                          {role.description}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <p className="app-muted text-sm">
                Assign roles after creating the account under Users → Role assignments.
              </p>
            )}

            <label className="app-label flex items-center gap-3 text-sm">
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

          <div className="mt-6 flex flex-col-reverse gap-3 app-divider border-t pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (isEdit && values.role_codes.length === 0)}
              className="app-btn-primary px-4 py-2 text-sm"
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
