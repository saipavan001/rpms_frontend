import { useCallback, useEffect, useState } from 'react';

import { getEmployees } from '../../employees/services/employee.service';
import type { Employee } from '../../employees/types/employee';
import UserModal from '../components/UserModal';
import {
  createUser,
  deleteUser,
  getAssignableRoles,
  getUsers,
  updateUser,
} from '../services/user.service';
import type { Role, User, UserFormValues } from '../types/user';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

const toFormValues = (user: User): UserFormValues => ({
  username: user.username,
  password: '',
  employee_id: user.employee_id ?? '',
  role_codes: user.roles.map((r) => r.code),
  is_active: user.is_active,
});

const UsersPage = () => {
  const [items, setItems] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [users, assignableRoles, employeeList] = await Promise.all([
        getUsers(),
        getAssignableRoles(),
        getEmployees(true),
      ]);
      setItems(users);
      setRoles(assignableRoles);
      setEmployees(employeeList);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (values: UserFormValues) => {
    try {
      setSaving(true);
      setError('');
      await createUser({
        username: values.username,
        password: values.password,
        employee_id: values.employee_id || null,
        role_codes: values.role_codes,
        is_active: values.is_active,
      });
      setModalMode(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create user.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (values: UserFormValues) => {
    if (!selectedItem) return;
    try {
      setSaving(true);
      setError('');
      await updateUser(selectedItem.id, {
        username: values.username,
        password: values.password || undefined,
        employee_id: values.employee_id || null,
        role_codes: values.role_codes,
        is_active: values.is_active,
      });
      setModalMode(null);
      setSelectedItem(null);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update user.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    try {
      setError('');
      await deleteUser(user.id);
      await loadItems();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete user.'));
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            Link an employee for Administrator or Employee accounts; leave
            unlinked for Administrator or Guest (read-only).
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedItem(null);
            setModalMode('create');
          }}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/5 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Roles</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 text-slate-200">
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">
                      {user.employee
                        ? `${user.employee.employee_code} — ${user.employee.employee_name}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {user.roles.map((r) => r.code).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      {user.is_active ? 'Active' : 'Inactive'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(user);
                          setModalMode('edit');
                        }}
                        className="mr-2 rounded-lg border border-white/10 px-3 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        className="rounded-lg border border-red-500/30 px-3 py-1 text-xs text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalMode === 'create' && (
        <UserModal
          title="Create User"
          submitLabel="Create"
          loading={saving}
          roles={roles}
          employees={employees}
          onClose={() => setModalMode(null)}
          onSubmit={handleCreate}
        />
      )}

      {modalMode === 'edit' && selectedItem && (
        <UserModal
          title="Edit User"
          submitLabel="Save"
          initialValues={toFormValues(selectedItem)}
          loading={saving}
          roles={roles}
          employees={employees}
          isEdit
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

export default UsersPage;
