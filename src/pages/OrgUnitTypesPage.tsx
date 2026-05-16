import { useCallback, useEffect, useState } from 'react';

import OrgUnitTypeModal from '../components/org-unit-types/OrgUnitTypeModal';
import {
  createOrgUnitType,
  deleteOrgUnitType,
  getOrgUnitTypes,
  updateOrgUnitType,
} from '../services/org-unit-type.service';
import type { OrgUnitType, OrgUnitTypeFormValues } from '../types/org-unit-type';
import { getApiErrorMessage } from '../utils/api-error';

type FilterValue = 'all' | 'active' | 'inactive';

const toFormValues = (item: OrgUnitType): OrgUnitTypeFormValues => ({
  code: item.code,
  name: item.name,
  description: item.description ?? '',
  is_active: item.is_active,
});

const OrgUnitTypesPage = () => {
  const [items, setItems] = useState<OrgUnitType[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrgUnitType | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const isActive =
        filter === 'all'
          ? undefined
          : filter === 'active';

      const data = await getOrgUnitTypes(isActive);
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load organization unit types.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (values: OrgUnitTypeFormValues) => {
    try {
      setSaving(true);
      setError('');

      await createOrgUnitType({
        code: values.code,
        name: values.name,
        description: values.description || undefined,
        is_active: values.is_active,
      });

      setModalMode(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create organization unit type.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: OrgUnitTypeFormValues) => {
    if (!selectedItem) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateOrgUnitType(selectedItem.id, {
        code: values.code,
        name: values.name,
        description: values.description || null,
        is_active: values.is_active,
      });

      setModalMode(null);
      setSelectedItem(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update organization unit type.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: OrgUnitType) => {
    const confirmed = window.confirm(
      `Delete organization unit type "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteOrgUnitType(item.id);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete organization unit type.'));
    }
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setModalMode('create');
  };

  const openEditModal = (item: OrgUnitType) => {
    setSelectedItem(item);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Organization Unit Types
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage organization unit type definitions
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          + Add Type
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-slate-300">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all" className="bg-slate-900">
            All
          </option>
          <option value="active" className="bg-slate-900">
            Active only
          </option>
          <option value="inactive" className="bg-slate-900">
            Inactive only
          </option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-200"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        {loading ? (
          <p className="p-8 text-center text-slate-400">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-400">
            No organization unit types found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-white/5 text-slate-200 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {item.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.is_active
                            ? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300'
                            : 'rounded-full bg-slate-500/15 px-2.5 py-1 text-xs font-medium text-slate-400'
                        }
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalMode === 'create' && (
        <OrgUnitTypeModal
          title="Add Organization Unit Type"
          submitLabel="Create"
          loading={saving}
          onClose={closeModal}
          onSubmit={handleCreate}
        />
      )}

      {modalMode === 'edit' && selectedItem && (
        <OrgUnitTypeModal
          title="Edit Organization Unit Type"
          submitLabel="Save Changes"
          initialValues={toFormValues(selectedItem)}
          loading={saving}
          onClose={closeModal}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default OrgUnitTypesPage;
