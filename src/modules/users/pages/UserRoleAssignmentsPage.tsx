import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '../../../shared/utils/api-error';
import {
  getAssignableRoles,
  getUsers,
  setUserRoles,
} from '../services/user.service';
import type { Role, User } from '../types/user';
import {
  ADMINISTRATIVE_ROLE_CODES,
  LINKED_EMPLOYEE_ROLE_CODES,
} from '../utils/account-roles';

const UserRoleAssignmentsPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [userList, roleList] = await Promise.all([
        getUsers(),
        getAssignableRoles(),
      ]);
      setUsers(userList);
      setRoles(roleList);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectUser = (userId: string) => {
    setSelectedId(userId);
    const user = users.find((u) => u.id === userId);
    setSelectedRoles(user?.roles.map((r) => r.code) ?? []);
    setMessage('');
  };

  const toggleRole = (code: string) => {
    setSelectedRoles((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const selectedUser = users.find((u) => u.id === selectedId);
  const allowedRoleCodes = selectedUser?.employee_id
    ? LINKED_EMPLOYEE_ROLE_CODES
    : ADMINISTRATIVE_ROLE_CODES;
  const visibleRoles = roles.filter((role) =>
    (allowedRoleCodes as readonly string[]).includes(role.code)
  );

  const save = async () => {
    if (!selectedId || selectedRoles.length === 0) {
      setError('Select a user and at least one role.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await setUserRoles(selectedId, selectedRoles);
      setMessage('Roles updated.');
      await load();
      selectUser(selectedId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update roles.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/users" className="text-sm text-slate-500 hover:underline">
            ← User accounts
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Role assignments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Assign one or more roles. Employee-linked users can combine e.g. Employee +
            Researcher (PI).
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          {message}
        </p>
      )}

      {loading ? (
        <p className="app-card p-8 text-center text-slate-500">Loading…</p>
      ) : (
        <div className="app-card grid gap-6 p-6 lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">User</label>
            <select
              className="app-select w-full"
              value={selectedId}
              onChange={(e) => selectUser(e.target.value)}
            >
              <option value="">Select user…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                  {u.roles.length ? ` (${u.roles.map((r) => r.code).join(', ')})` : ' (no roles)'}
                </option>
              ))}
            </select>
          </div>

          {selectedId && (
            <div>
              <p className="mb-2 text-sm font-medium">Roles</p>
              {selectedUser?.employee_id ? (
                <p className="mb-2 text-xs text-slate-500">
                  Linked to an employee — available: Administrator, Employee portal,
                  Researcher (PI).
                </p>
              ) : (
                <p className="mb-2 text-xs text-slate-500">
                  Administrative login — Guest cannot be combined with other roles.
                </p>
              )}
              <div className="space-y-2">
                {visibleRoles.map((role) => (
                  <label
                    key={role.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role.code)}
                      onChange={() => toggleRole(role.code)}
                    />
                    <span>
                      {role.name} <span className="text-slate-500">({role.code})</span>
                    </span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                className="app-btn-primary mt-4 px-4 py-2 text-sm"
                disabled={saving}
                onClick={() => void save()}
              >
                {saving ? 'Saving…' : 'Save roles'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRoleAssignmentsPage;
