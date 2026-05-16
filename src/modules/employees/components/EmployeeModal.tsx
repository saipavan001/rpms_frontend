import { useEffect, useState } from 'react';

import type { OrganizationUnit } from '../../organization-units/types/organization-unit';
import { APP_INPUT_CLASS } from '../../../shared/theme/classes';
import type { EmployeeFormValues } from '../types/employee';

type EmployeeModalProps = {
  title: string;
  initialValues?: EmployeeFormValues;
  submitLabel: string;
  loading?: boolean;
  organizationUnits: OrganizationUnit[];
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
};

const emptyValues: EmployeeFormValues = {
  employee_code: '',
  employee_name: '',
  email_official: '',
  email_personal: '',
  phone_number: '',
  employment_type: 'FULL_TIME',
  joining_date: '',
  ou_id: '',
  is_active: true,
};

const inputClass = APP_INPUT_CLASS;

const EmployeeModal = ({
  title,
  initialValues,
  submitLabel,
  loading = false,
  organizationUnits,
  onClose,
  onSubmit,
}: EmployeeModalProps) => {
  const [values, setValues] = useState<EmployeeFormValues>(
    initialValues ?? emptyValues
  );

  useEffect(() => {
    setValues(initialValues ?? emptyValues);
  }, [initialValues]);

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
          <button
            type="button"
            onClick={onClose}
            className="app-btn-icon flex h-9 w-9 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6"
        >
          <div className="space-y-4">
            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Employee code
              </label>
              <input
                type="text"
                value={values.employee_code}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    employee_code: e.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Employee name
              </label>
              <input
                type="text"
                value={values.employee_name}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    employee_name: e.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Official email
              </label>
              <input
                type="email"
                value={values.email_official}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    email_official: e.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Personal email
              </label>
              <input
                type="email"
                value={values.email_personal}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    email_personal: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Phone number
              </label>
              <input
                type="text"
                value={values.phone_number}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Employment type
              </label>
              <input
                type="text"
                value={values.employment_type}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    employment_type: e.target.value,
                  }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Joining date
              </label>
              <input
                type="date"
                value={values.joining_date}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    joining_date: e.target.value,
                  }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Organization unit
              </label>
              <select
                value={values.ou_id}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, ou_id: e.target.value }))
                }
                className={inputClass}
                required
              >
                <option value="" className="bg-slate-900">
                  Select unit
                </option>
                {organizationUnits.map((unit) => (
                  <option key={unit.id} value={unit.id} className="bg-slate-900">
                    {unit.code} — {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 app-label py-1 text-sm">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-white/20 dark:bg-white/10"
              />
              Active
            </label>
          </div>

          <div className="mt-6 flex shrink-0 flex-col-reverse gap-3 app-divider border-t pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary w-full px-4 py-3 text-sm sm:w-auto sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="app-btn-primary w-full px-4 py-3 text-sm sm:w-auto sm:py-2"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
