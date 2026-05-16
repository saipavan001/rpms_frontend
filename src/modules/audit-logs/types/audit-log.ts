export type AuditLog = {
  id: string;
  created_at: string;
  user_id: string | null;
  username: string | null;
  role_codes: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  http_method: string | null;
  http_path: string | null;
  status_code: number | null;
  ip_address: string | null;
  user_agent: string | null;
  summary: string | null;
  metadata: Record<string, unknown> | null;
};

export type AuditLogListResponse = {
  items: AuditLog[];
  next_cursor: string | null;
  has_more: boolean;
};

export type AuditLogFilters = {
  action?: string;
  entity_type?: string;
  user_id?: string;
  from?: string;
  to?: string;
};
