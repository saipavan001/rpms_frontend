import { useCallback, useEffect, useState } from 'react';

import { getOrganizationUnits } from '../../organization-units/services/organization-unit.service';
import type { OrganizationUnit } from '../../organization-units/types/organization-unit';
import EmployeeBulkUploadModal from '../components/EmployeeBulkUploadModal';
import EmployeeCard from '../components/EmployeeCard';
import EmployeeModal from '../components/EmployeeModal';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from '../services/employee.service';
import type {
  BulkCreateEmployeeResult,
  Employee,
  EmployeeFormValues,
} from '../types/employee';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useAuth } from '../../../shared/context/AuthContext';
import ViewOnlyBanner from '../../../shared/components/ViewOnlyBanner';

type FilterValue = 'all' | 'active' | 'inactive';

const toFormValues = (item: Employee): EmployeeFormValues => ({
  employee_code: item.employee_code,
  employee_name: item.employee_name,
  email_official: item.email_official,
  email_personal: item.email_personal ?? '',
  phone_number: item.phone_number ?? '',
  employment_type: item.employment_type,
  joining_date: item.joining_date
    ? item.joining_date.slice(0, 10)
    : '',
  ou_id: item.ou_id,
  is_active: item.is_active,
});

const EmployeesPage = () => {
  const { canWrite } = useAuth();
  const [items, setItems] = useState<Employee[]>([]);
  const [organizationUnits, setOrganizationUnits] = useState<OrganizationUnit[]>(
    []
  );
  const [filter, setFilter] = useState<FilterValue>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Employee | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const isActive =
        filter === 'all' ? undefined : filter === 'active';

      const [employees, units] = await Promise.all([
        getEmployees(isActive),
        getOrganizationUnits(true),
      ]);

      setItems(employees);
      setOrganizationUnits(units);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load employees.'));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (values: EmployeeFormValues) => {
    try {
      setSaving(true);
      setError('');

      await createEmployee({
        employee_code: values.employee_code,
        employee_name: values.employee_name,
        email_official: values.email_official,
        email_personal: values.email_personal || undefined,
        phone_number: values.phone_number || undefined,
        employment_type: values.employment_type,
        joining_date: values.joining_date || null,
        ou_id: values.ou_id,
        is_active: values.is_active,
      });

      setModalMode(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create employee.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: EmployeeFormValues) => {
    if (!selectedItem) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateEmployee(selectedItem.id, {
        employee_code: values.employee_code,
        employee_name: values.employee_name,
        email_official: values.email_official,
        email_personal: values.email_personal || null,
        phone_number: values.phone_number || null,
        employment_type: values.employment_type,
        joining_date: values.joining_date || null,
        ou_id: values.ou_id,
        is_active: values.is_active,
      });

      setModalMode(null);
      setSelectedItem(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update employee.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Employee) => {
    const confirmed = window.confirm(
      `Delete employee "${item.employee_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await deleteEmployee(item.id);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete employee.'));
    }
  };

  const handleBulkComplete = async (result: BulkCreateEmployeeResult) => {
    setBulkOpen(false);
    await loadItems();

    if (result.failed.length === 0) {
      setSuccess(
        `Successfully uploaded ${result.created.length} employee(s).`
      );
      setError('');
      return;
    }

    setSuccess(
      `Uploaded ${result.created.length} employee(s). ${result.failed.length} failed.`
    );
    setError(
      result.failed
        .slice(0, 5)
        .map((row) => `${row.employee_code}: ${row.message}`)
        .join(' · ')
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Employees</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage employees and bulk upload from CSV
          </p>
        </div>

        {canWrite && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="w-full rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 sm:w-auto sm:py-2.5"
            >
              Bulk upload
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedItem(null);
                setModalMode('create');
              }}
              disabled={organizationUnits.length === 0}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 sm:w-auto sm:py-2.5"
            >
              + Add Employee
            </button>
          </div>
        )}
      </div>

      {!canWrite && <ViewOnlyBanner />}

      {organizationUnits.length === 0 && !loading && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
          Create at least one organization unit before adding employees.
        </div>
      )}

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

      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {loading ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          Loading...
        </p>
      ) : items.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          No employees found.
        </p>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <EmployeeCard
                key={item.id}
                item={item}
                onEdit={(employee) => {
                  setSelectedItem(employee);
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
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="hidden px-4 py-3 font-medium lg:table-cell">
                      Organization unit
                    </th>
                    <th className="px-4 py-3 font-medium">Type</th>
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
                      <td className="px-4 py-3 font-mono text-xs">
                        {item.employee_code}
                      </td>
                      <td className="px-4 py-3">{item.employee_name}</td>
                      <td className="px-4 py-3">{item.email_official}</td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {item.organization_unit.name}
                      </td>
                      <td className="px-4 py-3">{item.employment_type}</td>
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
        <EmployeeModal
          title="Add Employee"
          submitLabel="Create"
          loading={saving}
          organizationUnits={organizationUnits}
          onClose={() => setModalMode(null)}
          onSubmit={handleCreate}
        />
      )}

      {canWrite && modalMode === 'edit' && selectedItem && (
        <EmployeeModal
          title="Edit Employee"
          submitLabel="Save Changes"
          initialValues={toFormValues(selectedItem)}
          loading={saving}
          organizationUnits={organizationUnits}
          onClose={() => {
            setModalMode(null);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
        />
      )}

      {canWrite && bulkOpen && (
        <EmployeeBulkUploadModal
          organizationUnits={organizationUnits}
          onClose={() => setBulkOpen(false)}
          onComplete={handleBulkComplete}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
