import { useCallback, useEffect, useState } from 'react';

import { getOrgUnitTypes } from '../../org-unit-types/services/org-unit-type.service';
import type { OrgUnitType } from '../../org-unit-types/types/org-unit-type';
import OrganizationUnitCard from '../components/OrganizationUnitCard';
import OrganizationUnitModal from '../components/OrganizationUnitModal';
import {
  createOrganizationUnit,
  deleteOrganizationUnit,
  getOrganizationUnits,
  updateOrganizationUnit,
} from '../services/organization-unit.service';
import type {
  OrganizationUnit,
  OrganizationUnitFormValues,
} from '../types/organization-unit';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useAuth } from '../../../shared/context/AuthContext';
import ViewOnlyBanner from '../../../shared/components/ViewOnlyBanner';

type FilterValue = 'all' | 'active' | 'inactive';

const toFormValues = (item: OrganizationUnit): OrganizationUnitFormValues => ({
  code: item.code,
  name: item.name,
  short_name: item.short_name ?? '',
  description: item.description ?? '',
  ou_type_id: item.ou_type_id,
  parent_ou_id: item.parent_ou_id ?? '',
  is_active: item.is_active,
});

const OrganizationUnitsPage = () => {
  const { canWrite } = useAuth();
  const [items, setItems] = useState<OrganizationUnit[]>([]);
  const [ouTypes, setOuTypes] = useState<OrgUnitType[]>([]);
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrganizationUnit | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const isActive =
        filter === 'all' ? undefined : filter === 'active';

      const [units, types] = await Promise.all([
        getOrganizationUnits(isActive),
        getOrgUnitTypes(true),
      ]);

      setItems(units);
      setOuTypes(types);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load organization units.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (values: OrganizationUnitFormValues) => {
    try {
      setSaving(true);
      setError('');

      await createOrganizationUnit({
        code: values.code,
        name: values.name,
        short_name: values.short_name || undefined,
        description: values.description || undefined,
        ou_type_id: values.ou_type_id,
        parent_ou_id: values.parent_ou_id || null,
        is_active: values.is_active,
      });

      setModalMode(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create organization unit.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: OrganizationUnitFormValues) => {
    if (!selectedItem) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateOrganizationUnit(selectedItem.id, {
        code: values.code,
        name: values.name,
        short_name: values.short_name || null,
        description: values.description || null,
        ou_type_id: values.ou_type_id,
        parent_ou_id: values.parent_ou_id || null,
        is_active: values.is_active,
      });

      setModalMode(null);
      setSelectedItem(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update organization unit.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: OrganizationUnit) => {
    const confirmed = window.confirm(
      `Delete organization unit "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteOrganizationUnit(item.id);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete organization unit.'));
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Organization Units
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage organizational structure and hierarchy
          </p>
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => {
              setSelectedItem(null);
              setModalMode('create');
            }}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:py-2.5"
          >
            + Add Unit
          </button>
        )}
      </div>

      {!canWrite && <ViewOnlyBanner />}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label className="text-sm text-slate-300">Filter</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterValue)}
          className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
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

      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          Loading...
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          No organization units found.
        </p>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <OrganizationUnitCard
                key={item.id}
                item={item}
                onEdit={(unit) => {
                  setSelectedItem(unit);
                  setModalMode('edit');
                }}
                onDelete={handleDelete}
                canWrite={canWrite}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-slate-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Parent
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
                      className="border-b border-white/5 text-slate-200 last:border-0 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-mono text-xs">{item.code}</td>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.ou_type.name}</td>
                      <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                        {item.parent_ou?.name ?? '—'}
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
        <OrganizationUnitModal
          title="Add Organization Unit"
          submitLabel="Create"
          loading={saving}
          ouTypes={ouTypes}
          organizationUnits={items}
          onClose={() => setModalMode(null)}
          onSubmit={handleCreate}
        />
      )}

      {canWrite && modalMode === 'edit' && selectedItem && (
        <OrganizationUnitModal
          title="Edit Organization Unit"
          submitLabel="Save Changes"
          initialValues={toFormValues(selectedItem)}
          loading={saving}
          ouTypes={ouTypes}
          organizationUnits={items}
          editingId={selectedItem.id}
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

export default OrganizationUnitsPage;
