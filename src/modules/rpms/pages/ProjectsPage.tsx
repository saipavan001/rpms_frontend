import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../shared/context/AuthContext';
import {
  canReviewRpmsProposals,
  canSelectProjectPi,
  isProposalAwaitingCommitteeReview,
} from '../../../shared/auth/permissions';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useProposalExport } from '../hooks/useProposalExport';
import { createProject, deleteProject, listProjects } from '../services/rpms.service';

type ProjectRow = {
  id: string;
  project_code: string;
  title: string;
  status: string;
  pi_user_id: string;
  department_ou?: { name: string };
  updated_at: string;
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  REVISION_REQUESTED: 'Revision requested',
  UNDER_COMMITTEE_REVIEW: 'Under committee review',
  COMMITTEE_APPROVED: 'Approved',
  COMMITTEE_REJECTED: 'Rejected',
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user, canCreateRpmsProjects } = useAuth();
  const [items, setItems] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const { startExport, exporting, error: exportError, setError: setExportError } =
    useProposalExport();

  const canDeleteDraft = (project: ProjectRow) =>
    project.status === 'DRAFT' &&
    Boolean(
      user &&
        (project.pi_user_id === user.id || canSelectProjectPi(user.roles))
    );

  const canReview = (project: ProjectRow) =>
    Boolean(
      user &&
        canReviewRpmsProposals(user.roles) &&
        isProposalAwaitingCommitteeReview(project.status)
    );

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listProjects();
      setItems(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load proposals.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (project: ProjectRow) => {
    if (!canDeleteDraft(project)) return;
    if (
      !window.confirm(
        `Delete draft proposal "${project.project_code}"?\n\nThis cannot be undone.`
      )
    ) {
      return;
    }
    try {
      setDeletingId(project.id);
      setError('');
      await deleteProject(project.id);
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete proposal.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setExportError('');
      await startExport({ scope: 'all', format: 'xlsx' });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to export proposals.'));
    }
  };

  const handleNew = async () => {
    try {
      setCreating(true);
      setError('');
      const project = await createProject();
      navigate(`/rpms/projects/${project.id}/edit`);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create proposal.'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Research proposals
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            RPMS — create, revise, and submit proposals for OU committee approval.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="app-btn-ghost px-5 py-3 text-sm"
            disabled={exporting || loading || items.length === 0}
            onClick={() => void handleExportAll()}
          >
            {exporting ? 'Preparing export…' : 'Export all (Excel)'}
          </button>
          {canCreateRpmsProjects && (
            <button
              type="button"
              className="app-btn-primary px-5 py-3 text-sm"
              disabled={creating}
              onClick={handleNew}
            >
              {creating ? 'Creating…' : 'New proposal'}
            </button>
          )}
        </div>
      </div>

      {(error || exportError) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error || exportError}
        </p>
      )}

      <div className="app-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading proposals…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No proposals yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-mono text-xs">{p.project_code}</td>
                    <td className="px-4 py-3">{p.title}</td>
                    <td className="px-4 py-3">{p.department_ou?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {canReview(p) ? (
                          <Link
                            to={`/rpms/projects/${p.id}/review`}
                            className="app-btn-primary px-3 py-1 text-xs"
                          >
                            Review
                          </Link>
                        ) : (
                          <Link
                            to={`/rpms/projects/${p.id}/edit`}
                            className="app-btn-ghost px-3 py-1 text-xs"
                          >
                            Open
                          </Link>
                        )}
                        {canDeleteDraft(p) && (
                          <button
                            type="button"
                            className="rounded-lg border border-red-500/30 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-500/10 dark:text-red-300"
                            disabled={deletingId === p.id}
                            onClick={() => void handleDelete(p)}
                          >
                            {deletingId === p.id ? 'Deleting…' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
