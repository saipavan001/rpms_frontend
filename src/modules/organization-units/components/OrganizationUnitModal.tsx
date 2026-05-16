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
  'app-input';

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
              <label className="mb-2 block app-label text-sm font-medium">
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
              <label className="mb-2 block app-label text-sm font-medium">
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
              <label className="mb-2 block app-label text-sm font-medium">
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
              <label className="mb-2 block app-label text-sm font-medium">
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
              <label className="mb-2 block app-label text-sm font-medium">
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

export default OrganizationUnitModal;
