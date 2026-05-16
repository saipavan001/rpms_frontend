import { useEffect, useState } from 'react';

import type { OrgUnitTypeFormValues } from '../types/org-unit-type';

type OrgUnitTypeModalProps = {
  title: string;
  initialValues?: OrgUnitTypeFormValues;
  submitLabel: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: OrgUnitTypeFormValues) => Promise<void>;
};

const emptyValues: OrgUnitTypeFormValues = {
  code: '',
  name: '',
  description: '',
  is_active: true,
};

const OrgUnitTypeModal = ({
  title,
  initialValues,
  submitLabel,
  loading = false,
  onClose,
  onSubmit,
}: OrgUnitTypeModalProps) => {
  const [values, setValues] = useState<OrgUnitTypeFormValues>(
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
                Code
              </label>
              <input
                type="text"
                value={values.code}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, code: e.target.value }))
                }
                className="app-input"
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
                className="app-input"
                required
              />
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
                className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
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

export default OrgUnitTypeModal;
