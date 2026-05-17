import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { getOrganizationUnits } from '../../organization-units/services/organization-unit.service';
import type { OrganizationUnit } from '../../organization-units/types/organization-unit';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import {
  getEligibleCommitteeUsers,
  listCommitteeRoles,
  listCommittees,
  setCommitteeMembers,
  upsertCommittee,
} from '../services/rpms.service';

type Committee = {
  id: string;
  ou_id: string;
  code: string;
  name: string;
  organization_unit: { id: string; name: string };
  members: {
    id: string;
    display_order: number;
    user: { id: string; username: string };
    committee_role: { id: string; name: string };
  }[];
};

type EligibleUser = {
  id: string;
  username: string;
  employee?: { employee_name: string } | null;
};

const RpmsSettingsPage = () => {
  const [ous, setOus] = useState<OrganizationUnit[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [roles, setRoles] = useState<{ id: string; code: string; name: string }[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<EligibleUser[]>([]);
  const [selectedOuId, setSelectedOuId] = useState('');
  const [committeeId, setCommitteeId] = useState('');
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRoleId, setMemberRoleId] = useState('');
  const [membersDraft, setMembersDraft] = useState<
    { user_id: string; committee_role_id: string; display_order: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [units, committeeList, roleList, users] = await Promise.all([
        getOrganizationUnits(true),
        listCommittees(),
        listCommitteeRoles(),
        getEligibleCommitteeUsers(),
      ]);
      setOus(units);
      setCommittees(committeeList);
      setRoles(roleList);
      setEligibleUsers(users);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load RPMS settings.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectOu = (ouId: string) => {
    setSelectedOuId(ouId);
    const existing = committees.find((c) => c.ou_id === ouId);
    if (existing) {
      setCommitteeId(existing.id);
      setMembersDraft(
        existing.members.map((m, i) => ({
          user_id: m.user.id,
          committee_role_id: m.committee_role.id,
          display_order: m.display_order ?? i + 1,
        }))
      );
    } else {
      setCommitteeId('');
      setMembersDraft([]);
    }
    setMessage('');
  };

  const handleCreateCommittee = async () => {
    const ou = ous.find((o) => o.id === selectedOuId);
    if (!ou) return;
    try {
      setSaving(true);
      setError('');
      const created = await upsertCommittee({
        ou_id: ou.id,
        code: `COMM-${ou.code}`,
        name: `${ou.name} Research Approval Committee`,
      });
      setCommitteeId(created.id);
      setMessage('Committee created. Add members below.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create committee.'));
    } finally {
      setSaving(false);
    }
  };

  const addMember = () => {
    if (!memberUserId || !memberRoleId) return;
    setMembersDraft((prev) => [
      ...prev,
      {
        user_id: memberUserId,
        committee_role_id: memberRoleId,
        display_order: prev.length + 1,
      },
    ]);
    setMemberUserId('');
    setMemberRoleId('');
  };

  const saveMembers = async () => {
    if (!committeeId) return;
    try {
      setSaving(true);
      setError('');
      await setCommitteeMembers(committeeId, membersDraft);
      setMessage('Committee members saved.');
      await load();
      selectOu(selectedOuId);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save members.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="app-card p-8 text-center text-slate-500">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          RPMS approval committees
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          One committee per organization unit. Only administrative users may be members.
        </p>
        <Link
          to="/rpms/settings/masters"
          className="mt-2 inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Manage funding agencies & budget masters →
        </Link>
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

      <div className="app-card grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <h2 className="app-card-title mb-3">Organization unit</h2>
          <select
            className="app-select w-full"
            value={selectedOuId}
            onChange={(e) => selectOu(e.target.value)}
          >
            <option value="" className="app-select-option">Select OU…</option>
            {ous.map((ou) => (
              <option key={ou.id} value={ou.id} className="app-select-option">
                {ou.name} {committees.some((c) => c.ou_id === ou.id) ? '✓' : ''}
              </option>
            ))}
          </select>
          {selectedOuId && !committeeId && (
            <button
              type="button"
              className="app-btn-primary mt-4 px-4 py-2 text-sm"
              disabled={saving}
              onClick={() => void handleCreateCommittee()}
            >
              Create committee for this OU
            </button>
          )}
        </div>

        {committeeId && (
          <div>
            <h2 className="app-card-title mb-3">Members (order = display order)</h2>
            <ul className="mb-4 space-y-1 text-sm">
              {membersDraft.map((m, i) => {
                const user = eligibleUsers.find((u) => u.id === m.user_id);
                const role = roles.find((r) => r.id === m.committee_role_id);
                return (
                  <li key={`${m.user_id}-${i}`}>
                    {i + 1}. {user?.username ?? m.user_id} — {role?.name}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className="app-select flex-1"
                value={memberUserId}
                onChange={(e) => setMemberUserId(e.target.value)}
              >
                <option value="" className="app-select-option">User…</option>
                {eligibleUsers.map((u) => (
                  <option key={u.id} value={u.id} className="app-select-option">
                    {u.username}
                    {u.employee ? ` (${u.employee.employee_name})` : ''}
                  </option>
                ))}
              </select>
              <select
                className="app-select flex-1"
                value={memberRoleId}
                onChange={(e) => setMemberRoleId(e.target.value)}
              >
                <option value="" className="app-select-option">Role…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="app-select-option">
                    {r.name}
                  </option>
                ))}
              </select>
              <button type="button" className="app-btn-secondary px-3 py-2 text-sm" onClick={addMember}>
                Add
              </button>
            </div>
            <button
              type="button"
              className="app-btn-primary mt-4 px-4 py-2 text-sm"
              disabled={saving || membersDraft.length === 0}
              onClick={() => void saveMembers()}
            >
              {saving ? 'Saving…' : 'Save members'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RpmsSettingsPage;
