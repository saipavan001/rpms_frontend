import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ProjectProposalPreview from '../components/ProjectProposalPreview';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  canReviewRpmsProposals,
  isProposalAwaitingCommitteeReview,
} from '../../../shared/auth/permissions';
import { getApiErrorMessage } from '../../../shared/utils/api-error';
import { useProposalExport } from '../hooks/useProposalExport';
import {
  approveProject,
  getProjectPreview,
  rejectProject,
  requestProjectRevision,
} from '../services/rpms.service';

const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  REVISION_REQUESTED: 'Revision requested',
  UNDER_COMMITTEE_REVIEW: 'Under committee review',
  SUBMITTED_TO_COMMITTEE: 'Submitted to committee',
  COMMITTEE_APPROVED: 'Approved by committee',
  COMMITTEE_REJECTED: 'Rejected by committee',
};

const ProjectReviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { startExport, exporting, error: exportError } = useProposalExport();

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const data = await getProjectPreview(id);
      setPreview(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load proposal.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="app-card p-8 text-center text-slate-500">Loading proposal…</p>;
  }

  if (!preview) {
    return (
      <p className="app-card p-8 text-center text-red-600 dark:text-red-400">
        {error || 'Proposal not found.'}
      </p>
    );
  }

  const project = preview.project as Record<string, unknown>;
  const status = String(project.status ?? '');
  const canReview =
    user &&
    canReviewRpmsProposals(user.roles) &&
    isProposalAwaitingCommitteeReview(status);
  const awaiting = isProposalAwaitingCommitteeReview(status);

  const handleApprove = async () => {
    if (!id || !canReview) return;
    if (!window.confirm('Approve this proposal?')) return;
    try {
      setSaving(true);
      setError('');
      await approveProject(id, comments.trim() || undefined);
      setMessage('Proposal approved.');
      navigate('/rpms/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to approve proposal.'));
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!id || !canReview) return;
    if (!comments.trim()) {
      setError('Enter comments explaining the rejection.');
      return;
    }
    if (!window.confirm('Reject this proposal?')) return;
    try {
      setSaving(true);
      setError('');
      await rejectProject(id, comments.trim());
      setMessage('Proposal rejected.');
      navigate('/rpms/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to reject proposal.'));
    } finally {
      setSaving(false);
    }
  };

  const handleRevision = async () => {
    if (!id || !canReview) return;
    if (!comments.trim()) {
      setError('Enter revision notes for the PI.');
      return;
    }
    if (!window.confirm('Send this proposal back for revision?')) return;
    try {
      setSaving(true);
      setError('');
      await requestProjectRevision(id, comments.trim());
      setMessage('Revision requested.');
      navigate('/rpms/projects');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to request revision.'));
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      setError('');
      await startExport({ scope: 'single', format: 'xlsx', projectIds: [id] });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to export proposal.'));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/rpms/projects" className="text-sm text-slate-500 hover:underline">
            ← Back to proposals
          </Link>
          <button
            type="button"
            className="app-btn-ghost px-4 py-2 text-sm"
            disabled={exporting || loading}
            onClick={() => void handleExport()}
          >
            {exporting ? 'Preparing export…' : 'Export (Excel)'}
          </button>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Committee review
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {String(project.project_code)} — {String(project.title)}
        </p>
        <p className="mt-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800">
            {statusLabel[status] ?? status}
          </span>
        </p>
      </div>

      {(error || exportError) && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error || exportError}
        </p>
      )}
      {message && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          {message}
        </p>
      )}

      <ProjectProposalPreview
        project={project}
        resolvedCommittee={(preview.resolved_committee as { name: string } | null) ?? null}
      />

      {canReview && (
        <div className="app-card space-y-4 p-6">
          <h2 className="app-card-title">Committee decision</h2>
          <p className="text-sm text-slate-500">
            Optional notes for approval; required for rejection or revision request.
          </p>
          <label className="block text-sm">
            Comments / notes
            <textarea
              className="app-input mt-1 w-full"
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Enter your comments…"
              disabled={saving}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="app-btn-primary px-4 py-2 text-sm"
              disabled={saving}
              onClick={() => void handleApprove()}
            >
              {saving ? 'Saving…' : 'Approve'}
            </button>
            <button
              type="button"
              className="rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
              disabled={saving}
              onClick={() => void handleRevision()}
            >
              Request revision
            </button>
            <button
              type="button"
              className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-300"
              disabled={saving}
              onClick={() => void handleReject()}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {!canReview && awaiting && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          You are not a member of this proposal’s approval committee, or you lack permission
          to record a decision.
        </p>
      )}

      {!awaiting && (
        <p className="text-sm text-slate-500">
          A committee decision has already been recorded for this proposal.
        </p>
      )}
    </div>
  );
};

export default ProjectReviewPage;
