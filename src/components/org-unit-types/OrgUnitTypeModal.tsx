import { useEffect, useState } from 'react';

import type { OrgUnitTypeFormValues } from '../../types/org-unit-type';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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
              className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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
