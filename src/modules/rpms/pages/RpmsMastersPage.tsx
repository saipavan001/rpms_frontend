import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage } from '../../../shared/utils/api-error';
import {
  createBudgetCategory,
  createBudgetHead,
  createFundingAgency,
  deleteBudgetCategory,
  deleteBudgetHead,
  deleteFundingAgency,
  listBudgetCategories,
  listFundingAgencies,
} from '../services/rpms.service';

type FundingAgency = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_active: boolean;
};

type BudgetHead = {
  id: string;
  code: string;
  name: string;
  display_order: number;
  is_active: boolean;
};

type BudgetCategory = {
  id: string;
  code: string;
  name: string;
  display_order: number;
  is_active: boolean;
  heads: BudgetHead[];
};

const inputClass = 'app-input w-full';
const selectClass = 'app-select w-full';
const optionClass = 'app-select-option';

const RpmsMastersPage = () => {
  const [agencies, setAgencies] = useState<FundingAgency[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [agencyForm, setAgencyForm] = useState({ code: '', name: '', description: '' });
  const [categoryForm, setCategoryForm] = useState({ code: '', name: '' });
  const [headForm, setHeadForm] = useState({
    budget_category_id: '',
    code: '',
    name: '',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [agencyList, categoryList] = await Promise.all([
        listFundingAgencies(),
        listBudgetCategories(),
      ]);
      setAgencies(agencyList);
      setCategories(categoryList);
      if (!headForm.budget_category_id && categoryList[0]) {
        setHeadForm((prev) => ({
          ...prev,
          budget_category_id: categoryList[0].id,
        }));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load RPMS masters.'));
    } finally {
      setLoading(false);
    }
  }, [headForm.budget_category_id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await createFundingAgency({
        code: agencyForm.code,
        name: agencyForm.name,
        description: agencyForm.description || null,
      });
      setAgencyForm({ code: '', name: '', description: '' });
      setMessage('Funding agency added.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create funding agency.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      await createBudgetCategory(categoryForm);
      setCategoryForm({ code: '', name: '' });
      setMessage('Budget category added.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create budget category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headForm.budget_category_id) return;
    try {
      setSaving(true);
      setError('');
      await createBudgetHead(headForm);
      setHeadForm((prev) => ({ ...prev, code: '', name: '' }));
      setMessage('Budget head added.');
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create budget head.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="app-card p-8 text-center text-slate-500">Loading masters…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Funding & budget masters
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure funding agencies, budget categories, and budget heads used in proposal
          estimates. Heads are grouped under categories and auto-filled year-wise on proposals.
        </p>
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

      <div className="app-card space-y-4 p-6">
        <h2 className="app-card-title">Funding agencies</h2>
        <ul className="divide-y divide-slate-200 text-sm dark:divide-slate-700">
          {agencies.map((agency) => (
            <li key={agency.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
              <span>
                <span className="font-mono text-xs text-slate-500">{agency.code}</span> —{' '}
                {agency.name}
                {!agency.is_active && (
                  <span className="ml-2 text-amber-600">(inactive)</span>
                )}
              </span>
              <button
                type="button"
                className="text-xs text-red-600 hover:underline dark:text-red-400"
                onClick={() =>
                  void (async () => {
                    if (!window.confirm(`Remove "${agency.name}"?`)) return;
                    await deleteFundingAgency(agency.id);
                    await load();
                  })()
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleCreateAgency} className="grid gap-3 sm:grid-cols-3">
          <input
            className={inputClass}
            placeholder="Code (e.g. DST)"
            value={agencyForm.code}
            onChange={(e) => setAgencyForm({ ...agencyForm, code: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Name"
            value={agencyForm.name}
            onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
            required
          />
          <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
            Add agency
          </button>
        </form>
      </div>

      <div className="app-card space-y-6 p-6">
        <h2 className="app-card-title">Budget categories & heads</h2>
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                <span className="font-mono text-xs text-slate-500">{cat.code}</span> — {cat.name}
              </p>
              <button
                type="button"
                className="text-xs text-red-600 hover:underline dark:text-red-400"
                onClick={() =>
                  void (async () => {
                    if (!window.confirm(`Remove category "${cat.name}" and its heads?`)) return;
                    await deleteBudgetCategory(cat.id);
                    await load();
                  })()
                }
              >
                Remove category
              </button>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {cat.heads.map((head) => (
                <li key={head.id} className="flex items-center justify-between gap-2">
                  <span>
                    {head.name}{' '}
                    <span className="font-mono text-xs text-slate-400">({head.code})</span>
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline dark:text-red-400"
                    onClick={() =>
                      void (async () => {
                        if (!window.confirm(`Remove head "${head.name}"?`)) return;
                        await deleteBudgetHead(head.id);
                        await load();
                      })()
                    }
                  >
                    Remove
                  </button>
                </li>
              ))}
              {!cat.heads.length && (
                <li className="text-slate-400">No heads defined for this category.</li>
              )}
            </ul>
          </div>
        ))}

        <form onSubmit={handleCreateCategory} className="grid gap-3 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-3">
          <input
            className={inputClass}
            placeholder="Category code"
            value={categoryForm.code}
            onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Category name"
            value={categoryForm.name}
            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            required
          />
          <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
            Add category
          </button>
        </form>

        <form onSubmit={handleCreateHead} className="grid gap-3 sm:grid-cols-4">
          <select
            className={selectClass}
            value={headForm.budget_category_id}
            onChange={(e) =>
              setHeadForm({ ...headForm, budget_category_id: e.target.value })
            }
            required
          >
            <option value="" className={optionClass}>
              Category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className={optionClass}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Head code"
            value={headForm.code}
            onChange={(e) => setHeadForm({ ...headForm, code: e.target.value })}
            required
          />
          <input
            className={inputClass}
            placeholder="Head name"
            value={headForm.name}
            onChange={(e) => setHeadForm({ ...headForm, name: e.target.value })}
            required
          />
          <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
            Add head
          </button>
        </form>
      </div>
    </div>
  );
};

export default RpmsMastersPage;
