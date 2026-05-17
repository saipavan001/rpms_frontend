import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../../shared/context/AuthContext';
import { canSelectProjectPi } from '../../../shared/auth/permissions';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import ProjectProposalPreview from '../components/ProjectProposalPreview';
import { clearanceLabels } from '../constants/clearance-labels';
import {
  deleteProject,
  getProject,
  getProjectPreview,
  getRpmsMasters,
  initializeProjectBudget,
  submitProject,
  updateProjectBasic,
  updateProjectBudget,
  updateProjectClearances,
  updateProjectInfrastructure,
} from '../services/rpms.service';

const STEPS = ['Basic', 'Infrastructure', 'Clearances', 'Budget', 'Preview'] as const;

const inputClass = 'app-input w-full';
const selectClass = 'app-select w-full';
const optionClass = 'app-select-option';

type TeamEmployee = {
  id: string;
  employee_code: string;
  employee_name: string;
  ou_id: string;
  username: string | null;
};

type TeamMemberRow = {
  role: string;
  employee_id?: string | null;
  employee?: { employee_code: string; employee_name: string } | null;
  member_name?: string | null;
};

type BudgetYearRow = {
  year_index: number;
  label: string;
  period_start: string;
  period_end: string;
  lines: {
    funding_agency_id?: string | null;
    funding_agency?: { id: string; name: string } | null;
    budget_head_id?: string | null;
    budget_category: string;
    budget_head: string;
    amount: number | string;
    justification?: string | null;
  }[];
};

type BudgetLineDraft = {
  year_index: number;
  funding_agency_id: string;
  funding_agency_name: string;
  budget_head_id: string;
  budget_category: string;
  budget_head: string;
  amount: string;
  justification: string;
};

type ProjectFundingAgencyLink = {
  funding_agency_id: string;
  funding_agency: { id: string; name: string };
};

const buildAgencyNameMap = (
  project: Record<string, unknown>,
  masters?: { fundingAgencies: { id: string; name: string }[] } | null
) => {
  const map: Record<string, string> = {};
  for (const agency of masters?.fundingAgencies ?? []) {
    map[agency.id] = agency.name;
  }
  const links = (project.funding_agencies as ProjectFundingAgencyLink[]) ?? [];
  for (const link of links) {
    map[link.funding_agency_id] = link.funding_agency.name;
  }
  return map;
};

const extractBudgetLines = (
  project: Record<string, unknown>,
  masters?: { fundingAgencies: { id: string; name: string }[] } | null
): BudgetLineDraft[] => {
  const agencyNames = buildAgencyNameMap(project, masters);
  const years = (project.budget_years as BudgetYearRow[]) ?? [];
  const lines: BudgetLineDraft[] = [];
  for (const year of years) {
    for (const line of year.lines ?? []) {
      const agencyId = String(line.funding_agency_id ?? line.funding_agency?.id ?? '');
      lines.push({
        year_index: year.year_index,
        funding_agency_id: agencyId,
        funding_agency_name:
          String(line.funding_agency?.name ?? '') || agencyNames[agencyId] || '',
        budget_head_id: String(line.budget_head_id ?? ''),
        budget_category: String(line.budget_category),
        budget_head: String(line.budget_head),
        amount: String(Number(line.amount) || 0),
        justification: String(line.justification ?? ''),
      });
    }
  }
  return lines;
};

const employeeLabel = (e: TeamEmployee) =>
  `${e.employee_code} — ${e.employee_name}${e.username ? ` (${e.username})` : ''}`;

const ProjectWizardPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminSelectsPi = user ? canSelectProjectPi(user.roles) : false;
  const [step, setStep] = useState(0);
  const [project, setProject] = useState<Record<string, unknown> | null>(null);
  const [piEmployeeId, setPiEmployeeId] = useState('');
  const [coPiIds, setCoPiIds] = useState<string[]>([]);
  const [showCoPiSection, setShowCoPiSection] = useState(false);
  const [fundingAgencyIds, setFundingAgencyIds] = useState<string[]>([]);
  const [masters, setMasters] = useState<{
    projectTypes: { id: string; name: string }[];
    fundingAgencies: { id: string; name: string }[];
    organizationUnits: { id: string; name: string }[];
    teamEmployees: TeamEmployee[];
  } | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [budgetLines, setBudgetLines] = useState<BudgetLineDraft[]>([]);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const editable =
    project?.status === 'DRAFT' || project?.status === 'REVISION_REQUESTED';

  const isDraft = project?.status === 'DRAFT';
  const canDeleteDraft =
    isDraft &&
    Boolean(
      user &&
        id &&
        (String((project as Record<string, unknown>)?.pi_user_id) === user.id ||
          adminSelectsPi)
    );

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const [p, m] = await Promise.all([getProject(id), getRpmsMasters()]);
      setProject(p);
      setMasters(m);
      const team = (p.team_members as TeamMemberRow[]) ?? [];
      const piRow = team.find((t) => t.role === 'PI');
      setPiEmployeeId(
        String(piRow?.employee_id ?? p.pi_employee_id ?? user?.employee_id ?? '')
      );
      const existingCoPis = team
        .filter((t) => t.role === 'CO_PI' && t.employee_id)
        .map((t) => String(t.employee_id));
      setCoPiIds(existingCoPis);
      setShowCoPiSection(existingCoPis.length > 0);
      const agencyLinks = (p.funding_agencies as ProjectFundingAgencyLink[]) ?? [];
      if (agencyLinks.length > 0) {
        setFundingAgencyIds(agencyLinks.map((link) => link.funding_agency_id));
      } else if (p.funding_agency_id) {
        setFundingAgencyIds([String(p.funding_agency_id)]);
      } else {
        setFundingAgencyIds([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load proposal.'));
    } finally {
      setLoading(false);
    }
  }, [id, user?.employee_id]);

  useEffect(() => {
    load();
  }, [load]);

  const loadPreview = useCallback(async () => {
    if (!id) return;
    const data = await getProjectPreview(id);
    setPreview(data);
  }, [id]);

  useEffect(() => {
    if (step !== 4 || !id) return;
    void loadPreview();
  }, [step, id, loadPreview]);

  useEffect(() => {
    if (step !== 3 || !id || !project || !project.include_budget_estimate) return;

    const years = (project.budget_years as BudgetYearRow[]) ?? [];
    if (years.length > 0) {
      setBudgetLines(extractBudgetLines(project, masters));
      return;
    }

    if (!project.tentative_start_date || !project.tentative_end_date) return;

    const agencyLinks = (project.funding_agencies as ProjectFundingAgencyLink[]) ?? [];
    const hasAgencies =
      agencyLinks.length > 0 || fundingAgencyIds.length > 0 || Boolean(project.funding_agency_id);
    if (!hasAgencies) return;

    const initBudget = async () => {
      try {
        setBudgetLoading(true);
        setError('');
        const updated = await initializeProjectBudget(id);
        setProject(updated);
        setBudgetLines(extractBudgetLines(updated, masters));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to prepare budget template.'));
      } finally {
        setBudgetLoading(false);
      }
    };

    void initBudget();
  }, [step, id, project, masters, fundingAgencyIds]);

  const goPreview = async () => {
    try {
      setSaving(true);
      await loadPreview();
      setStep(4);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load preview.'));
    } finally {
      setSaving(false);
    }
  };

  const saveBasic = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !project) return;
    const fd = new FormData(e.currentTarget);
    try {
      setSaving(true);
      setError('');
      const effectivePiId = adminSelectsPi
        ? piEmployeeId
        : String(user?.employee_id ?? piEmployeeId);

      if (!effectivePiId) {
        setError('Principal investigator is required.');
        return;
      }

      const includeBudget = fd.get('include_budget_estimate') === 'on';
      if (includeBudget && fundingAgencyIds.length === 0) {
        setError('Select at least one funding agency when budget estimate is included.');
        return;
      }

      const updated = await updateProjectBasic(id, {
        title: String(fd.get('title') || ''),
        project_type_id: String(fd.get('project_type_id') || '') || null,
        department_ou_id: String(fd.get('department_ou_id') || ''),
        abstract: String(fd.get('abstract') || '') || null,
        keywords: String(fd.get('keywords') || '') || null,
        tentative_start_date: String(fd.get('tentative_start_date') || '') || null,
        tentative_end_date: String(fd.get('tentative_end_date') || '') || null,
        funding_agency_ids: fundingAgencyIds,
        funding_type: String(fd.get('funding_type') || '') || null,
        sponsorship_details: String(fd.get('sponsorship_details') || '') || null,
        grant_reference: String(fd.get('grant_reference') || '') || null,
        include_budget_estimate: fd.get('include_budget_estimate') === 'on',
        ...(adminSelectsPi ? { pi_employee_id: effectivePiId } : {}),
        co_pi_employee_ids: coPiIds.filter((cid) => cid !== effectivePiId),
      });
      setProject(updated);
      setStep(1);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save basic details.'));
    } finally {
      setSaving(false);
    }
  };

  const saveInfrastructure = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    const fd = new FormData(e.currentTarget);
    const required = fd.get('infrastructure_required') === 'yes';
    try {
      setSaving(true);
      setError('');
      const updated = await updateProjectInfrastructure(id, {
        infrastructure_required: required,
        laboratory_requirements: String(fd.get('laboratory_requirements') || '') || null,
        equipment_requirements: String(fd.get('equipment_requirements') || '') || null,
        workspace_requirements: String(fd.get('workspace_requirements') || '') || null,
        computing_requirements: String(fd.get('computing_requirements') || '') || null,
        university_support_notes: String(fd.get('university_support_notes') || '') || null,
      });
      setProject(updated);
      setStep(2);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save infrastructure.'));
    } finally {
      setSaving(false);
    }
  };

  const saveClearances = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id || !project) return;
    const fd = new FormData(e.currentTarget);
    const clearances = (
      (project.clearances as { clearance_type: string }[]) ?? []
    ).map((c) => {
      const prefix = c.clearance_type;
      return {
        clearance_type: c.clearance_type,
        is_required: fd.get(`${prefix}_required`) === 'on',
        committee_name: String(fd.get(`${prefix}_committee`) || '') || null,
        application_number: String(fd.get(`${prefix}_application`) || '') || null,
        status: String(fd.get(`${prefix}_status`) || 'DRAFT'),
        approval_date: String(fd.get(`${prefix}_date`) || '') || null,
        notes: String(fd.get(`${prefix}_notes`) || '') || null,
      };
    });

    try {
      setSaving(true);
      setError('');
      const updated = await updateProjectClearances(id, clearances);
      setProject(updated);
      const includeBudget = Boolean(updated.include_budget_estimate);
      setStep(includeBudget ? 3 : 4);
      if (!includeBudget) await loadPreview();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save clearances.'));
    } finally {
      setSaving(false);
    }
  };

  const updateBudgetLine = (
    yearIndex: number,
    fundingAgencyId: string,
    budgetHeadId: string,
    field: 'amount' | 'justification',
    value: string
  ) => {
    setBudgetLines((prev) =>
      prev.map((line) =>
        line.year_index === yearIndex &&
        line.funding_agency_id === fundingAgencyId &&
        line.budget_head_id === budgetHeadId
          ? { ...line, [field]: value }
          : line
      )
    );
  };

  const saveBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    const lines = budgetLines.map((line) => ({
      year_index: line.year_index,
      funding_agency_id: line.funding_agency_id || null,
      budget_head_id: line.budget_head_id || null,
      budget_category: line.budget_category,
      budget_head: line.budget_head,
      amount: Number(line.amount) || 0,
      justification: line.justification || null,
    }));
    try {
      setSaving(true);
      setError('');
      const updated = await updateProjectBudget(id, lines);
      setProject(updated);
      setBudgetLines(extractBudgetLines(updated, masters));
      await goPreview();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save budget.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    if (!window.confirm('Submit this proposal to the OU approval committee?')) return;
    try {
      setSaving(true);
      setError('');
      await submitProject(id);
      navigate('/rpms/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to submit proposal.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !project) {
    return <p className="app-card p-8 text-center text-slate-500">Loading proposal…</p>;
  }

  const p = project as Record<string, unknown>;
  const revisionNotes = p.revision_notes as string | null;
  const teamEmployees = masters?.teamEmployees ?? [];
  const piEmployee = teamEmployees.find((e) => e.id === piEmployeeId);
  const coPiOptions = teamEmployees.filter((e) => e.id !== piEmployeeId);

  const handleDeleteDraft = async () => {
    if (!id || !canDeleteDraft) return;
    const code = String((project as Record<string, unknown>)?.project_code ?? '');
    if (
      !window.confirm(
        `Delete draft proposal "${code}"?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setSaving(true);
      setError('');
      await deleteProject(id);
      navigate('/rpms/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete proposal.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleCoPi = (employeeId: string) => {
    setCoPiIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleFundingAgency = (agencyId: string) => {
    setFundingAgencyIds((prev) =>
      prev.includes(agencyId)
        ? prev.filter((id) => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const selectedFundingAgencies =
    masters?.fundingAgencies.filter((agency) =>
      fundingAgencyIds.includes(agency.id)
    ) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/rpms/projects" className="text-sm text-slate-500 hover:underline">
            ← Back to proposals
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {String(p.title)} <span className="font-mono text-sm">({String(p.project_code)})</span>
          </h1>
          {!editable && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              Read-only — status: {String(p.status)}
            </p>
          )}
          {revisionNotes && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
              Committee revision notes: {revisionNotes}
            </p>
          )}
        </div>
        {canDeleteDraft && (
          <button
            type="button"
            className="shrink-0 rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-300"
            disabled={saving}
            onClick={() => void handleDeleteDraft()}
          >
            {saving ? 'Deleting…' : 'Delete draft'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={[
              'rounded-full px-3 py-1 text-xs font-medium',
              step === i
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
            ].join(' ')}
            onClick={() => {
              if (i === 4) void goPreview();
              else setStep(i);
            }}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      {step === 0 && (
        <form onSubmit={saveBasic} className="app-card space-y-4 p-6">
          <h2 className="app-card-title">Basic details</h2>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Principal investigator (PI)
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Required. Co-PI is optional — use “Add Co-PI” only if your proposal has
              co-investigators.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  PI
                </span>
                {adminSelectsPi ? (
                  <select
                    className={selectClass}
                    value={piEmployeeId}
                    onChange={(e) => {
                      setPiEmployeeId(e.target.value);
                      setCoPiIds((prev) => prev.filter((id) => id !== e.target.value));
                    }}
                    required
                    disabled={!editable}
                  >
                    <option value="" className={optionClass}>
                      Select employee…
                    </option>
                    {teamEmployees.map((e) => (
                      <option key={e.id} value={e.id} className={optionClass}>
                        {employeeLabel(e)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="app-input mt-1 bg-slate-50 dark:bg-slate-800/80">
                    {piEmployee
                      ? employeeLabel(piEmployee)
                      : user?.employee
                        ? `${user.employee.employee_code} — ${user.employee.employee_name}`
                        : 'Your employee record (linked at login)'}
                  </div>
                )}
                {!adminSelectsPi && (
                  <p className="mt-1 text-xs text-slate-500">
                    You are recorded as PI automatically from your logged-in account.
                  </p>
                )}
              </div>

              {!showCoPiSection ? (
                editable && (
                  <button
                    type="button"
                    className="app-btn-secondary px-3 py-2 text-sm"
                    onClick={() => setShowCoPiSection(true)}
                  >
                    + Add Co-PI (optional)
                  </button>
                )
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Co-PI <span className="font-normal text-slate-500">(optional)</span>
                    </span>
                    {editable && (
                      <button
                        type="button"
                        className="text-xs text-slate-500 hover:text-slate-300"
                        onClick={() => {
                          setShowCoPiSection(false);
                          setCoPiIds([]);
                        }}
                      >
                        Remove Co-PIs
                      </button>
                    )}
                  </div>
                  {coPiOptions.length === 0 ? (
                    <p className="text-xs text-slate-500">No other employees available.</p>
                  ) : (
                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-white/10">
                      {coPiOptions.map((e) => (
                        <label
                          key={e.id}
                          className="flex cursor-pointer items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={coPiIds.includes(e.id)}
                            onChange={() => toggleCoPi(e.id)}
                            disabled={!editable}
                          />
                          <span>{employeeLabel(e)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <label className="mt-1 block text-sm text-slate-700 dark:text-slate-200">
            Title
            <input name="title" className={`${inputClass} mt-1`} defaultValue={String(p.title)} required disabled={!editable} />
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-200">
            Department (OU)
            <select name="department_ou_id" className={`${selectClass} mt-1`} defaultValue={String((p.department_ou as { id?: string })?.id ?? p.department_ou_id)} required disabled={!editable}>
              {masters?.organizationUnits.map((ou) => (
                <option key={ou.id} value={ou.id} className={optionClass}>{ou.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-700 dark:text-slate-200">
            Project type
            <select name="project_type_id" className={`${selectClass} mt-1`} defaultValue={String(p.project_type_id ?? '')} disabled={!editable}>
              <option value="" className={optionClass}>— Select type —</option>
              {masters?.projectTypes.map((t) => (
                <option key={t.id} value={t.id} className={optionClass}>{t.name}</option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Funding agencies
            </span>
            <p className="mb-2 text-xs text-slate-500">
              Select one or more. Budget estimates are entered separately for each agency.
            </p>
            {!masters?.fundingAgencies.length ? (
              <p className="text-xs text-slate-500">No funding agencies configured.</p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-white/10">
                {masters.fundingAgencies.map((agency) => (
                  <label
                    key={agency.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={fundingAgencyIds.includes(agency.id)}
                      onChange={() => toggleFundingAgency(agency.id)}
                      disabled={!editable}
                    />
                    <span>{agency.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <label className="block text-sm text-slate-700 dark:text-slate-200">
            Funding type
            <input
              name="funding_type"
              className={`${inputClass} mt-1`}
              placeholder="e.g. Grant, Sponsored research"
              defaultValue={String(p.funding_type ?? '')}
              disabled={!editable}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              Start date
              <input type="date" name="tentative_start_date" className={inputClass} defaultValue={p.tentative_start_date ? String(p.tentative_start_date).slice(0, 10) : ''} required disabled={!editable} />
            </label>
            <label className="block text-sm">
              End date
              <input type="date" name="tentative_end_date" className={inputClass} defaultValue={p.tentative_end_date ? String(p.tentative_end_date).slice(0, 10) : ''} required disabled={!editable} />
            </label>
          </div>
          <label className="block text-sm">
            Abstract
            <textarea name="abstract" className={inputClass} rows={4} defaultValue={String(p.abstract ?? '')} disabled={!editable} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="include_budget_estimate" defaultChecked={Boolean(p.include_budget_estimate)} disabled={!editable} />
            Include budget estimate
          </label>
          {editable && (
            <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save & continue'}
            </button>
          )}
        </form>
      )}

      {step === 1 && (
        <form onSubmit={saveInfrastructure} className="app-card space-y-4 p-6">
          <h2 className="app-card-title">Infrastructure</h2>
          <fieldset className="space-y-2 text-sm" disabled={!editable}>
            <label className="flex items-center gap-2">
              <input type="radio" name="infrastructure_required" value="yes" defaultChecked={Boolean(p.infrastructure_required)} />
              Infrastructure required
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="infrastructure_required" value="no" defaultChecked={!p.infrastructure_required} />
              Not required
            </label>
          </fieldset>
          <label className="block text-sm">
            University support / notes
            <textarea name="university_support_notes" className={inputClass} rows={3} defaultValue={String(p.university_support_notes ?? '')} disabled={!editable} />
          </label>
          {editable && (
            <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save & continue'}
            </button>
          )}
        </form>
      )}

      {step === 2 && (
        <form onSubmit={saveClearances} className="app-card space-y-6 p-6">
          <h2 className="app-card-title">Ethics & clearances</h2>
          {((p.clearances as Record<string, unknown>[]) ?? []).map((c) => {
            const type = String(c.clearance_type);
            return (
              <div key={type} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                <p className="font-medium">{clearanceLabels[type] ?? type}</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" name={`${type}_required`} defaultChecked={Boolean(c.is_required)} disabled={!editable} />
                  Required
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input name={`${type}_committee`} placeholder="Committee name" className={inputClass} defaultValue={String(c.committee_name ?? '')} disabled={!editable} />
                  <input name={`${type}_application`} placeholder="Application no." className={inputClass} defaultValue={String(c.application_number ?? '')} disabled={!editable} />
                  <select name={`${type}_status`} className={selectClass} defaultValue={String(c.status)} disabled={!editable}>
                    {['DRAFT', 'SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
                      <option key={s} value={s} className={optionClass}>{s}</option>
                    ))}
                  </select>
                  <input type="date" name={`${type}_date`} className={inputClass} defaultValue={c.approval_date ? String(c.approval_date).slice(0, 10) : ''} disabled={!editable} />
                </div>
              </div>
            );
          })}
          {editable && (
            <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save & continue'}
            </button>
          )}
        </form>
      )}

      {step === 3 && Boolean(p.include_budget_estimate) && (
        <form onSubmit={saveBudget} className="app-card space-y-6 p-6">
          <div>
            <h2 className="app-card-title">Budget estimate</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter amounts per funding agency, budget head, and project year.
            </p>
            {selectedFundingAgencies.length > 0 && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                <strong>Agencies:</strong>{' '}
                {selectedFundingAgencies.map((a) => a.name).join(', ')}
              </p>
            )}
          </div>

          {budgetLoading && (
            <p className="text-sm text-slate-500">Preparing budget template…</p>
          )}

          {!budgetLoading && selectedFundingAgencies.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Select at least one funding agency on the Basic step, save, then return here.
            </p>
          )}

          {!budgetLoading &&
            selectedFundingAgencies.length > 0 &&
            budgetLines.length === 0 && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Set project start and end dates on the Basic step and save, then return here.
              </p>
            )}

          {Array.from(
            new Set(budgetLines.map((line) => line.year_index))
          )
            .sort((a, b) => a - b)
            .map((yearIndex) => {
              const yearMeta = ((p.budget_years as BudgetYearRow[]) ?? []).find(
                (y) => y.year_index === yearIndex
              );
              const agencyIds = Array.from(
                new Set(
                  budgetLines
                    .filter((line) => line.year_index === yearIndex)
                    .map((line) => line.funding_agency_id)
                    .filter(Boolean)
                )
              );

              return (
                <div key={yearIndex} className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {yearMeta?.label ?? `Year ${yearIndex}`}
                    {yearMeta && (
                      <span className="ml-2 font-normal text-slate-500">
                        ({String(yearMeta.period_start).slice(0, 10)} —{' '}
                        {String(yearMeta.period_end).slice(0, 10)})
                      </span>
                    )}
                  </h3>
                  {agencyIds.map((agencyId) => {
                    const agencyName =
                      selectedFundingAgencies.find((a) => a.id === agencyId)?.name ??
                      budgetLines.find((l) => l.funding_agency_id === agencyId)
                        ?.funding_agency_name ??
                      'Funding agency';
                    const agencyLines = budgetLines.filter(
                      (line) =>
                        line.year_index === yearIndex && line.funding_agency_id === agencyId
                    );
                    const agencyTotal = agencyLines.reduce(
                      (sum, line) => sum + (Number(line.amount) || 0),
                      0
                    );

                    return (
                      <div
                        key={`${yearIndex}-${agencyId}`}
                        className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        <div className="bg-slate-50 px-4 py-2 text-sm font-medium dark:bg-slate-800/50">
                          {agencyName}
                          <span className="float-right font-normal text-slate-500">
                            Subtotal: {agencyTotal.toLocaleString()}
                          </span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/40">
                              <tr>
                                <th className="px-3 py-2">Category</th>
                                <th className="px-3 py-2">Head</th>
                                <th className="px-3 py-2 w-32">Amount</th>
                                <th className="px-3 py-2">Justification</th>
                              </tr>
                            </thead>
                            <tbody>
                              {agencyLines.map((line) => (
                                <tr
                                  key={`${line.year_index}-${line.funding_agency_id}-${line.budget_head_id}`}
                            className="border-b border-slate-100 dark:border-slate-800"
                          >
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">
                              {line.budget_category}
                            </td>
                            <td className="px-3 py-2">{line.budget_head}</td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                className={inputClass}
                                min={0}
                                step="0.01"
                                value={line.amount}
                                disabled={!editable}
                                onChange={(e) =>
                                  updateBudgetLine(
                                    line.year_index,
                                    line.funding_agency_id,
                                    line.budget_head_id,
                                    'amount',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                className={inputClass}
                                value={line.justification}
                                disabled={!editable}
                                onChange={(e) =>
                                  updateBudgetLine(
                                    line.year_index,
                                    line.funding_agency_id,
                                    line.budget_head_id,
                                    'justification',
                                    e.target.value
                                  )
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                    );
                  })}
                </div>
              );
            })}

          {editable && budgetLines.length > 0 && (
            <button type="submit" className="app-btn-primary px-4 py-2 text-sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save & preview'}
            </button>
          )}
        </form>
      )}

      {step === 4 && (
        <div className="app-card space-y-4 p-6">
          <h2 className="app-card-title">Preview & submit</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review all sections before submitting to the approval committee.
          </p>
          {!preview && <p className="text-sm text-slate-500">Loading preview…</p>}
          {preview && (
            <>
              <ProjectProposalPreview
                project={preview.project as Record<string, unknown>}
                resolvedCommittee={
                  (preview.resolved_committee as { name: string } | null) ?? null
                }
              />
              {editable && (
                <button
                  type="button"
                  className="app-btn-primary px-5 py-3 text-sm"
                  disabled={saving || !preview.resolved_committee}
                  onClick={() => void handleSubmit()}
                >
                  {saving ? 'Submitting…' : 'Confirm & submit to committee'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectWizardPage;
