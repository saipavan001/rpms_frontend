import { clearanceLabels } from '../constants/clearance-labels';

type TeamMemberRow = {
  role: string;
  employee?: { employee_code: string; employee_name: string } | null;
  member_name?: string | null;
};

type ProjectFundingAgencyLink = {
  funding_agency_id: string;
  funding_agency: { id: string; name: string };
};

type BudgetYearRow = {
  year_index: number;
  label: string;
  period_start: string;
  period_end: string;
  lines: {
    funding_agency_id?: string | null;
    funding_agency?: { id: string; name: string } | null;
    budget_category: string;
    budget_head: string;
    amount: number | string;
    justification?: string | null;
  }[];
};

const formatDate = (value: unknown) => {
  if (!value) return '—';
  return String(value).slice(0, 10);
};

const formatAmount = (value: number | string) =>
  Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PreviewSection = ({
  title,
  complete,
  children,
}: {
  title: string;
  complete?: boolean;
  children: React.ReactNode;
}) => (
  <section className="rounded-lg border border-slate-200 dark:border-slate-700">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {complete !== undefined && (
        <span
          className={[
            'rounded-full px-2 py-0.5 text-xs font-medium',
            complete
              ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
          ].join(' ')}
        >
          {complete ? 'Complete' : 'Incomplete'}
        </span>
      )}
    </div>
    <div className="space-y-3 p-4 text-sm">{children}</div>
  </section>
);

const PreviewField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {label}
    </p>
    <p className="mt-0.5 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
      {value ?? '—'}
    </p>
  </div>
);

type ProjectProposalPreviewProps = {
  project: Record<string, unknown>;
  resolvedCommittee?: { name: string } | null;
};

const ProjectProposalPreview = ({
  project,
  resolvedCommittee,
}: ProjectProposalPreviewProps) => {
  const team = (project.team_members as TeamMemberRow[]) ?? [];
  const pi = team.find((t) => t.role === 'PI');
  const copis = team.filter((t) => t.role === 'CO_PI');

  const fundingAgencyNames = (() => {
    const links = (project.funding_agencies as ProjectFundingAgencyLink[]) ?? [];
    if (links.length) return links.map((l) => l.funding_agency.name).join(', ');
    const legacy = project.funding_agency as { name?: string } | undefined;
    return legacy?.name ?? '—';
  })();

  const budgetYears = (project.budget_years as BudgetYearRow[]) ?? [];
  const includeBudget = Boolean(project.include_budget_estimate);
  const grandTotal = budgetYears.reduce(
    (sum, year) =>
      sum + (year.lines ?? []).reduce((ySum, line) => ySum + Number(line.amount || 0), 0),
    0
  );

  return (
    <div className="space-y-4">
      <PreviewSection title="Basic details" complete={Boolean(project.section_basic_complete)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewField label="Proposal code" value={String(project.project_code ?? '—')} />
          <PreviewField label="Status" value={String(project.status ?? '—')} />
          <PreviewField label="Title" value={String(project.title ?? '—')} />
          <PreviewField
            label="Project type"
            value={String((project.project_type as { name?: string })?.name ?? '—')}
          />
          <PreviewField
            label="Department"
            value={String((project.department_ou as { name?: string })?.name ?? '—')}
          />
          <PreviewField label="Start date" value={formatDate(project.tentative_start_date)} />
          <PreviewField label="End date" value={formatDate(project.tentative_end_date)} />
          <PreviewField label="Funding agencies" value={fundingAgencyNames} />
          <PreviewField label="Funding type" value={String(project.funding_type ?? '—')} />
          <PreviewField
            label="Grant reference"
            value={String(project.grant_reference ?? '—')}
          />
          <PreviewField
            label="Sponsorship details"
            value={String(project.sponsorship_details ?? '—')}
          />
        </div>
        <PreviewField label="Keywords" value={String(project.keywords ?? '—')} />
        <PreviewField label="Abstract" value={String(project.abstract ?? '—')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <PreviewField
            label="Principal investigator"
            value={
              pi?.employee
                ? `${pi.employee.employee_code} — ${pi.employee.employee_name}`
                : pi?.member_name ?? '—'
            }
          />
          <PreviewField
            label="Co-PI"
            value={
              copis.length
                ? copis
                    .map((c) =>
                      c.employee ? c.employee.employee_name : c.member_name ?? '—'
                    )
                    .join(', ')
                : 'None'
            }
          />
        </div>
      </PreviewSection>

      <PreviewSection
        title="Infrastructure"
        complete={Boolean(project.section_infrastructure_complete)}
      >
        <PreviewField
          label="Infrastructure required"
          value={project.infrastructure_required ? 'Yes' : 'No'}
        />
        {Boolean(project.infrastructure_required) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <PreviewField
              label="Laboratory requirements"
              value={String(project.laboratory_requirements ?? '—')}
            />
            <PreviewField
              label="Equipment requirements"
              value={String(project.equipment_requirements ?? '—')}
            />
            <PreviewField
              label="Workspace requirements"
              value={String(project.workspace_requirements ?? '—')}
            />
            <PreviewField
              label="Computing requirements"
              value={String(project.computing_requirements ?? '—')}
            />
          </div>
        )}
        <PreviewField
          label="University support / notes"
          value={String(project.university_support_notes ?? '—')}
        />
      </PreviewSection>

      <PreviewSection
        title="Ethics & clearances"
        complete={Boolean(project.section_clearance_complete)}
      >
        {((project.clearances as Record<string, unknown>[]) ?? []).map((c) => {
          const type = String(c.clearance_type);
          return (
            <div
              key={type}
              className="rounded-lg border border-slate-100 p-3 dark:border-slate-800"
            >
              <p className="font-medium">{clearanceLabels[type] ?? type}</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <PreviewField label="Required" value={c.is_required ? 'Yes' : 'No'} />
                <PreviewField label="Status" value={String(c.status ?? '—')} />
                <PreviewField label="Committee" value={String(c.committee_name ?? '—')} />
                <PreviewField
                  label="Application no."
                  value={String(c.application_number ?? '—')}
                />
                <PreviewField label="Approval date" value={formatDate(c.approval_date)} />
              </div>
              {c.notes ? <PreviewField label="Notes" value={String(c.notes)} /> : null}
            </div>
          );
        })}
      </PreviewSection>

      {includeBudget && (
        <PreviewSection
          title="Budget estimate"
          complete={Boolean(project.section_budget_complete)}
        >
          {budgetYears.length === 0 ? (
            <p className="text-slate-500">No budget lines saved yet.</p>
          ) : (
            <>
              <p className="font-medium text-slate-700 dark:text-slate-200">
                Grand total: {formatAmount(grandTotal)}
              </p>
              {budgetYears.map((year) => {
                const agencyIds = Array.from(
                  new Set(
                    (year.lines ?? [])
                      .map((line) => line.funding_agency_id ?? line.funding_agency?.id)
                      .filter(Boolean) as string[]
                  )
                );

                return (
                  <div key={year.year_index} className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {year.label} ({formatDate(year.period_start)} —{' '}
                      {formatDate(year.period_end)})
                    </h4>
                    {(agencyIds.length ? agencyIds : ['']).map((agencyId) => {
                      const agencyLines = agencyId
                        ? (year.lines ?? []).filter(
                            (line) =>
                              (line.funding_agency_id ?? line.funding_agency?.id) === agencyId
                          )
                        : year.lines ?? [];
                      const agencyName = agencyId
                        ? agencyLines[0]?.funding_agency?.name ?? 'Funding agency'
                        : 'All agencies';
                      const agencyTotal = agencyLines.reduce(
                        (sum, line) => sum + Number(line.amount || 0),
                        0
                      );

                      return (
                        <div
                          key={`${year.year_index}-${agencyId}`}
                          className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800"
                        >
                          <div className="bg-slate-50 px-3 py-1.5 text-xs font-medium dark:bg-slate-800/40">
                            {agencyName}
                            <span className="float-right font-normal text-slate-500">
                              Subtotal: {formatAmount(agencyTotal)}
                            </span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-xs">
                              <thead className="border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                  <th className="px-3 py-2">Category</th>
                                  <th className="px-3 py-2">Head</th>
                                  <th className="px-3 py-2 text-right">Amount</th>
                                  <th className="px-3 py-2">Justification</th>
                                </tr>
                              </thead>
                              <tbody>
                                {agencyLines.map((line, idx) => (
                                  <tr
                                    key={`${agencyId}-${line.budget_head}-${idx}`}
                                    className="border-b border-slate-50 dark:border-slate-800/80"
                                  >
                                    <td className="px-3 py-2">{line.budget_category}</td>
                                    <td className="px-3 py-2">{line.budget_head}</td>
                                    <td className="px-3 py-2 text-right font-mono">
                                      {formatAmount(line.amount)}
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">
                                      {line.justification || '—'}
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
            </>
          )}
        </PreviewSection>
      )}

      <PreviewSection title="Submission">
        {resolvedCommittee ? (
          <PreviewField label="Approval committee" value={String(resolvedCommittee.name)} />
        ) : (
          <p className="text-red-600 dark:text-red-400">
            No approval committee configured for this department.
          </p>
        )}
      </PreviewSection>
    </div>
  );
};

export default ProjectProposalPreview;
