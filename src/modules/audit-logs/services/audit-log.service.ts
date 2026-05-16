import { apiClient } from '../../../shared/api/apiClient';
import type { ApiResponse } from '../../../shared/types/api';
import type { AuditLogFilters, AuditLogListResponse } from '../types/audit-log';

export const getAuditLogs = async (
  cursor?: string | null,
  filters: AuditLogFilters = {},
  limit = 50
): Promise<AuditLogListResponse> => {
  const response = await apiClient.get<ApiResponse<AuditLogListResponse>>(
    '/audit-logs',
    {
      params: {
        limit,
        cursor: cursor ?? undefined,
        action: filters.action || undefined,
        entity_type: filters.entity_type || undefined,
        user_id: filters.user_id || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      },
    }
  );

  return response.data.data;
};
