import { useEffect, useState } from 'react';

import type { OrgUnitType } from '../../org-unit-types/types/org-unit-type';
import type { OrgUnitTypeHierarchyFormValues } from '../types/org-unit-type-hierarchy';

type OrgUnitTypeHierarchyModalProps = {
  title: string;
  initialValues?: OrgUnitTypeHierarchyFormValues;
  submitLabel: string;
  loading?: boolean;
  ouTypes: OrgUnitType[];
  onClose: () => void;
  onSubmit: (values: OrgUnitTypeHierarchyFormValues) => Promise<void>;
};

const emptyValues: OrgUnitTypeHierarchyFormValues = {
  parent_ou_type_id: '',
  child_ou_type_id: '',
  display_order: '',
  is_active: true,
};

const inputClass =
  'app-input';

const OrgUnitTypeHierarchyModal = ({
  title,
  initialValues,
  submitLabel,
  loading = false,
  ouTypes,
  onClose,
  onSubmit,
}: OrgUnitTypeHierarchyModalProps) => {
  const [values, setValues] = useState<OrgUnitTypeHierarchyFormValues>(
    initialValues ?? emptyValues
  );

  useEffect(() => {
    setValues(initialValues ?? emptyValues);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (values.parent_ou_type_id === values.child_ou_type_id) {
      return;
    }

    await onSubmit(values);
  };

  const sameTypeSelected =
    values.parent_ou_type_id &&
    values.child_ou_type_id &&
    values.parent_ou_type_id === values.child_ou_type_id;

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
                Parent organization unit type
              </label>
              <select
                value={values.parent_ou_type_id}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    parent_ou_type_id: e.target.value,
                  }))
                }
                className={inputClass}
                required
              >
                <option value="" className="bg-slate-900">
                  Select parent type
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
                Child organization unit type
              </label>
              <select
                value={values.child_ou_type_id}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    child_ou_type_id: e.target.value,
                  }))
                }
                className={inputClass}
                required
              >
                <option value="" className="bg-slate-900">
                  Select child type
                </option>
                {ouTypes.map((type) => (
                  <option key={type.id} value={type.id} className="bg-slate-900">
                    {type.code} — {type.name}
                  </option>
                ))}
              </select>
            </div>

            {sameTypeSelected && (
              <p className="text-sm text-amber-300">
                Parent and child types must be different.
              </p>
            )}

            <div>
              <label className="mb-2 block app-label text-sm font-medium">
                Display order
              </label>
              <input
                type="number"
                value={values.display_order}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    display_order: e.target.value,
                  }))
                }
                className={inputClass}
                min={0}
                step={1}
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
              disabled={loading || Boolean(sameTypeSelected)}
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

export default OrgUnitTypeHierarchyModal;
