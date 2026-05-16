import { useCallback, useEffect, useState } from 'react';

import OrgUnitTypeCard from '../components/OrgUnitTypeCard';
import OrgUnitTypeModal from '../components/OrgUnitTypeModal';
import {
  createOrgUnitType,
  deleteOrgUnitType,
  getOrgUnitTypes,
  updateOrgUnitType,
} from '../services/org-unit-type.service';
import type { OrgUnitType, OrgUnitTypeFormValues } from '../types/org-unit-type';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useAuth } from '../../../shared/context/AuthContext';
import ViewOnlyBanner from '../../../shared/components/ViewOnlyBanner';

type FilterValue = 'all' | 'active' | 'inactive';

const toFormValues = (item: OrgUnitType): OrgUnitTypeFormValues => ({
  code: item.code,
  name: item.name,
  description: item.description ?? '',
  is_active: item.is_active,
});

const OrgUnitTypesPage = () => {
  const { canWrite } = useAuth();
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
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="app-page-title">
            Organization Unit Types
          </h1>
          <p className="mt-1 app-muted text-sm">
            Manage organization unit type definitions
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={openCreateModal}
            className="app-btn-primary w-full px-5 py-3 text-sm sm:w-auto sm:py-2.5"
          >
            + Add Type
          </button>
        )}
      </div>

      {!canWrite && <ViewOnlyBanner />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="app-label text-sm">Filter</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="app-select sm:w-auto"
        >
          <option value="all" className="app-select-option">
            All
          </option>
          <option value="active" className="app-select-option">
            Active only
          </option>
          <option value="inactive" className="app-select-option">
            Inactive only
          </option>
        </select>
      </div>

      {error && (
        <div
          role="alert"
          className="app-alert-warning"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="app-card rounded-2xl p-8 text-center text-slate-400">
          Loading...
        </p>
      ) : items.length === 0 ? (
        <p className="app-card rounded-2xl p-8 text-center text-slate-400">
          No organization unit types found.
        </p>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <OrgUnitTypeCard
                key={item.id}
                item={item}
                onEdit={openEditModal}
                onDelete={handleDelete}
                canWrite={canWrite}
              />
            ))}
          </div>

          <div className="app-table-wrap hidden backdrop-blur-xl md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
              <thead className="app-table-head">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="hidden px-4 py-3 font-medium lg:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {canWrite && (
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="app-table-row last:border-0 hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-slate-400 lg:table-cell">
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
                    {canWrite && (
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="app-btn-ghost px-3 py-1.5 text-xs"
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
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

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
