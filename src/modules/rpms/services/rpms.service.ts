import { apiClient } from '../../../shared/api/apiClient';

export const getRpmsMasters = () =>
  apiClient.get('/rpms/masters').then((r) => r.data);

export const listProjects = () =>
  apiClient.get('/rpms/projects').then((r) => r.data);

export const createProject = (body?: { pi_employee_id?: string }) =>
  apiClient.post('/rpms/projects', body ?? {}).then((r) => r.data);

export const getProject = (id: string) =>
  apiClient.get(`/rpms/projects/${id}`).then((r) => r.data);

export const deleteProject = (id: string) =>
  apiClient.delete(`/rpms/projects/${id}`).then((r) => r.data);

export const updateProjectBasic = (id: string, body: unknown) =>
  apiClient.patch(`/rpms/projects/${id}/basic`, body).then((r) => r.data);

export const updateProjectInfrastructure = (id: string, body: unknown) =>
  apiClient.patch(`/rpms/projects/${id}/infrastructure`, body).then((r) => r.data);

export const updateProjectClearances = (id: string, clearances: unknown[]) =>
  apiClient
    .patch(`/rpms/projects/${id}/clearances`, { clearances })
    .then((r) => r.data);

export const updateProjectBudget = (id: string, lines: unknown[]) =>
  apiClient.patch(`/rpms/projects/${id}/budget`, { lines }).then((r) => r.data);

export const getProjectPreview = (id: string) =>
  apiClient.get(`/rpms/projects/${id}/preview`).then((r) => r.data);

export const submitProject = (id: string) =>
  apiClient.post(`/rpms/projects/${id}/submit`).then((r) => r.data);

export const approveProject = (id: string, comments?: string) =>
  apiClient
    .post(`/rpms/projects/${id}/approve`, { comments: comments ?? null })
    .then((r) => r.data);

export const rejectProject = (id: string, comments: string) =>
  apiClient.post(`/rpms/projects/${id}/reject`, { comments }).then((r) => r.data);

export const requestProjectRevision = (id: string, comments: string) =>
  apiClient
    .post(`/rpms/projects/${id}/request-revision`, { comments })
    .then((r) => r.data);

export const listCommittees = () =>
  apiClient.get('/rpms/settings/committees').then((r) => r.data);

export const listCommitteeRoles = () =>
  apiClient.get('/rpms/settings/committee-roles').then((r) => r.data);

export const getEligibleCommitteeUsers = () =>
  apiClient.get('/rpms/settings/eligible-committee-users').then((r) => r.data);

export const upsertCommittee = (body: unknown) =>
  apiClient.post('/rpms/settings/committees', body).then((r) => r.data);

export const setCommitteeMembers = (committeeId: string, members: unknown[]) =>
  apiClient
    .put(`/rpms/settings/committees/${committeeId}/members`, { members })
    .then((r) => r.data);

export const listFundingAgencies = (activeOnly = false) =>
  apiClient
    .get('/rpms/settings/funding-agencies', {
      params: activeOnly ? { active: 'true' } : undefined,
    })
    .then((r) => r.data);

export const createFundingAgency = (body: unknown) =>
  apiClient.post('/rpms/settings/funding-agencies', body).then((r) => r.data);

export const updateFundingAgency = (id: string, body: unknown) =>
  apiClient.patch(`/rpms/settings/funding-agencies/${id}`, body).then((r) => r.data);

export const deleteFundingAgency = (id: string) =>
  apiClient.delete(`/rpms/settings/funding-agencies/${id}`).then((r) => r.data);

export const listBudgetCategories = (activeOnly = false) =>
  apiClient
    .get('/rpms/settings/budget-categories', {
      params: activeOnly ? { active: 'true' } : undefined,
    })
    .then((r) => r.data);

export const createBudgetCategory = (body: unknown) =>
  apiClient.post('/rpms/settings/budget-categories', body).then((r) => r.data);

export const updateBudgetCategory = (id: string, body: unknown) =>
  apiClient.patch(`/rpms/settings/budget-categories/${id}`, body).then((r) => r.data);

export const deleteBudgetCategory = (id: string) =>
  apiClient.delete(`/rpms/settings/budget-categories/${id}`).then((r) => r.data);

export const createBudgetHead = (body: unknown) =>
  apiClient.post('/rpms/settings/budget-heads', body).then((r) => r.data);

export const updateBudgetHead = (id: string, body: unknown) =>
  apiClient.patch(`/rpms/settings/budget-heads/${id}`, body).then((r) => r.data);

export const deleteBudgetHead = (id: string) =>
  apiClient.delete(`/rpms/settings/budget-heads/${id}`).then((r) => r.data);

export const initializeProjectBudget = (id: string) =>
  apiClient.post(`/rpms/projects/${id}/budget/initialize`).then((r) => r.data);

export type ProposalExportJob = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  format: 'XLSX' | 'JSON';
  scope: 'ALL' | 'SELECTED' | 'SINGLE';
  project_ids: string[];
  file_name: string | null;
  file_size: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  download_ready: boolean;
};

export const createProposalExport = (body: {
  scope: 'all' | 'selected' | 'single';
  format?: 'xlsx' | 'json';
  projectIds?: string[];
}) => apiClient.post<ProposalExportJob>('/rpms/exports', body).then((r) => r.data);

export const listProposalExports = (limit = 20) =>
  apiClient
    .get<ProposalExportJob[]>('/rpms/exports', { params: { limit } })
    .then((r) => r.data);

export const getProposalExport = (id: string) =>
  apiClient.get<ProposalExportJob>(`/rpms/exports/${id}`).then((r) => r.data);

export const downloadProposalExport = (id: string) =>
  apiClient
    .get<Blob>(`/rpms/exports/${id}/download`, { responseType: 'blob' })
    .then((r) => r.data);

export const exportProject = (
  projectId: string,
  format: 'xlsx' | 'json' = 'xlsx'
) =>
  apiClient
    .post<ProposalExportJob>(`/rpms/projects/${projectId}/export`, { format })
    .then((r) => r.data);
