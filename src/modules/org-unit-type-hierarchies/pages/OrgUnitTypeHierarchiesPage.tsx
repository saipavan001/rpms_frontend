import { useCallback, useEffect, useState } from 'react';

import { getOrgUnitTypes } from '../../org-unit-types/services/org-unit-type.service';
import type { OrgUnitType } from '../../org-unit-types/types/org-unit-type';
import OrgUnitTypeHierarchyCard from '../components/OrgUnitTypeHierarchyCard';
import OrgUnitTypeHierarchyModal from '../components/OrgUnitTypeHierarchyModal';
import {
  createOrgUnitTypeHierarchy,
  deleteOrgUnitTypeHierarchy,
  getOrgUnitTypeHierarchies,
  updateOrgUnitTypeHierarchy,
} from '../services/org-unit-type-hierarchy.service';
import type {
  OrgUnitTypeHierarchy,
  OrgUnitTypeHierarchyFormValues,
} from '../types/org-unit-type-hierarchy';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useAuth } from '../../../shared/context/AuthContext';
import ViewOnlyBanner from '../../../shared/components/ViewOnlyBanner';

type FilterValue = 'all' | 'active' | 'inactive';

const toFormValues = (
  item: OrgUnitTypeHierarchy
): OrgUnitTypeHierarchyFormValues => ({
  parent_ou_type_id: item.parent_ou_type_id,
  child_ou_type_id: item.child_ou_type_id,
  display_order:
    item.display_order === null ? '' : String(item.display_order),
  is_active: item.is_active,
});

const parseDisplayOrder = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    throw new Error('Display order must be a whole number');
  }
  return parsed;
};

const OrgUnitTypeHierarchiesPage = () => {
  const { canWrite } = useAuth();
  const [items, setItems] = useState<OrgUnitTypeHierarchy[]>([]);
  const [ouTypes, setOuTypes] = useState<OrgUnitType[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrgUnitTypeHierarchy | null>(
    null
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    const isActive =
      filter === 'all' ? undefined : filter === 'active';

    try {
      const types = await getOrgUnitTypes();
      setOuTypes(types);
    } catch (err) {
      setOuTypes([]);
      setError(
        getApiErrorMessage(err, 'Failed to load organization unit types.')
      );
    }

    try {
      const hierarchies = await getOrgUnitTypeHierarchies(isActive);
      setItems(hierarchies);
    } catch (err) {
      setItems([]);
      const hierarchyError = getApiErrorMessage(
        err,
        'Failed to load organization unit type hierarchies.'
      );
      setError((current) => current || hierarchyError);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (values: OrgUnitTypeHierarchyFormValues) => {
    try {
      setSaving(true);
      setError('');

      await createOrgUnitTypeHierarchy({
        parent_ou_type_id: values.parent_ou_type_id,
        child_ou_type_id: values.child_ou_type_id,
        display_order: parseDisplayOrder(values.display_order),
        is_active: values.is_active,
      });

      setModalMode(null);
      await loadItems();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Failed to create organization unit type hierarchy.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: OrgUnitTypeHierarchyFormValues) => {
    if (!selectedItem) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateOrgUnitTypeHierarchy(selectedItem.id, {
        parent_ou_type_id: values.parent_ou_type_id,
        child_ou_type_id: values.child_ou_type_id,
        display_order: parseDisplayOrder(values.display_order),
        is_active: values.is_active,
      });

      setModalMode(null);
      setSelectedItem(null);
      await loadItems();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Failed to update organization unit type hierarchy.')
      );
    } finally {
      setSaving(false);
    }
  };

  const activeOuTypes = ouTypes.filter((type) => type.is_active);

  const handleDelete = async (item: OrgUnitTypeHierarchy) => {
    const confirmed = window.confirm(
      `Delete hierarchy "${item.parent_ou_type.name} → ${item.child_ou_type.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteOrgUnitTypeHierarchy(item.id);
      await loadItems();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Failed to delete organization unit type hierarchy.')
      );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="app-page-title">
            Org Unit Type Hierarchy
          </h1>
          <p className="mt-1 app-muted text-sm">
            Define allowed parent–child relationships between organization unit types
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => {
              setSelectedItem(null);
              setModalMode('create');
            }}
            disabled={activeOuTypes.length < 2}
            className="app-btn-primary w-full px-5 py-3 text-sm sm:w-auto sm:py-2.5"
          >
            + Add Hierarchy
          </button>
        )}
      </div>

      {!canWrite && <ViewOnlyBanner />}

      {!loading && ouTypes.length < 2 && (
        <div className="app-alert-warning">
          Create at least two organization unit types before defining hierarchies.
        </div>
      )}

      {!loading && ouTypes.length >= 2 && activeOuTypes.length < 2 && (
        <div className="app-alert-warning">
          You have {ouTypes.length} organization unit type(s), but fewer than two
          are active. Activate at least two types to add a hierarchy.
        </div>
      )}

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
          No organization unit type hierarchies found.
        </p>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <OrgUnitTypeHierarchyCard
                key={item.id}
                item={item}
                onEdit={(row) => {
                  setSelectedItem(row);
                  setModalMode('edit');
                }}
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
                    <th className="px-4 py-3 font-medium">Parent type</th>
                    <th className="px-4 py-3 font-medium">Child type</th>
                    <th className="px-4 py-3 font-medium">Order</th>
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
                      <td className="px-4 py-3">
                        <span className="font-mono app-muted text-xs">
                          {item.parent_ou_type.code}
                        </span>
                        <span className="ml-2">{item.parent_ou_type.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono app-muted text-xs">
                          {item.child_ou_type.code}
                        </span>
                        <span className="ml-2">{item.child_ou_type.name}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {item.display_order ?? '—'}
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
                              onClick={() => {
                                setSelectedItem(item);
                                setModalMode('edit');
                              }}
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

      {canWrite && modalMode === 'create' && (
        <OrgUnitTypeHierarchyModal
          title="Add Organization Unit Type Hierarchy"
          submitLabel="Create"
          loading={saving}
          ouTypes={activeOuTypes}
          onClose={() => setModalMode(null)}
          onSubmit={handleCreate}
        />
      )}

      {canWrite && modalMode === 'edit' && selectedItem && (
        <OrgUnitTypeHierarchyModal
          title="Edit Organization Unit Type Hierarchy"
          submitLabel="Save Changes"
          initialValues={toFormValues(selectedItem)}
          loading={saving}
          ouTypes={activeOuTypes}
          onClose={() => {
            setModalMode(null);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default OrgUnitTypeHierarchiesPage;
