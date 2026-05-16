import { useEffect, useState } from 'react';

import type { OrgUnitType } from '../../org-unit-types/types/org-unit-type';
import type {
  OrganizationUnit,
  OrganizationUnitFormValues,
} from '../types/organization-unit';

type OrganizationUnitModalProps = {
  title: string;
  initialValues?: OrganizationUnitFormValues;
  submitLabel: string;
  loading?: boolean;
  ouTypes: OrgUnitType[];
  organizationUnits: OrganizationUnit[];
  editingId?: string;
  onClose: () => void;
  onSubmit: (values: OrganizationUnitFormValues) => Promise<void>;
};

const emptyValues: OrganizationUnitFormValues = {
  code: '',
  name: '',
  short_name: '',
  description: '',
  ou_type_id: '',
  parent_ou_id: '',
  is_active: true,
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm';

const OrganizationUnitModal = ({
  title,
  initialValues,
  submitLabel,
  loading = false,
  ouTypes,
  organizationUnits,
  editingId,
  onClose,
  onSubmit,
}: OrganizationUnitModalProps) => {
  const [values, setValues] = useState<OrganizationUnitFormValues>(
    initialValues ?? emptyValues
  );

  useEffect(() => {
    setValues(initialValues ?? emptyValues);
  }, [initialValues]);

  const parentOptions = organizationUnits.filter((unit) => unit.id !== editingId);

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
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
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
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Code
              </label>
              <input
                type="text"
                value={values.code}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, code: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Name
              </label>
              <input
                type="text"
                value={values.name}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, name: e.target.value }))
                }
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Short name
              </label>
              <input
                type="text"
                value={values.short_name}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, short_name: e.target.value }))
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Organization unit type
              </label>
              <select
                value={values.ou_type_id}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, ou_type_id: e.target.value }))
                }
                className={inputClass}
                required
              >
                <option value="" className="bg-slate-900">
                  Select type
                </option>
                {ouTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-slate-900">
                    {type.code} — {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Parent organization unit
              </label>
              <select
                value={values.parent_ou_id}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    parent_ou_id: e.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="" className="bg-slate-900">
                  None
                </option>
                {parentOptions.map((unit) => (
                  <option key={unit.id} value={unit.id} className="bg-slate-900">
                    {unit.code} — {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-200">
                Description
              </label>
              <textarea
                value={values.description}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <label className="flex items-center gap-3 py-1 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={values.is_active}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="h-5 w-5 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>
          </div>

          <div className="mt-6 flex shrink-0 flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/10 sm:w-auto sm:py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:py-2"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationUnitModal;
