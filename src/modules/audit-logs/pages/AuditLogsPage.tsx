import { useCallback, useEffect, useState } from 'react';

import { getAuditLogs } from '../services/audit-log.service';
import type { AuditLog, AuditLogFilters } from '../types/audit-log';
import { getApiErrorMessage } from '../../../shared/utils/api-error';

const inputClass =
  'rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500';

const formatWhen = (value: string) => {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const AuditLogsPage = () => {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [draftFilters, setDraftFilters] = useState<AuditLogFilters>({});

  const loadPage = useCallback(
    async (cursor: string | null, append: boolean) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError('');

        const result = await getAuditLogs(cursor, filters, 50);

        setItems((prev) => (append ? [...prev, ...result.items] : result.items));
        setNextCursor(result.next_cursor);
        setHasMore(result.has_more);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load audit logs.'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadPage(null, false);
  }, [loadPage]);

  const applyFilters = () => {
    setFilters({ ...draftFilters });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="app-page-title">Audit log</h1>
        <p className="mt-1 app-muted text-sm">
          Append-only activity trail for security and compliance. Uses cursor
          pagination for large datasets.
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="mb-1 block app-muted text-xs">Action</label>
          <input
            type="text"
            value={draftFilters.action ?? ''}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, action: e.target.value }))
            }
            placeholder="CREATE, LOGIN..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block app-muted text-xs">Entity type</label>
          <input
            type="text"
            value={draftFilters.entity_type ?? ''}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, entity_type: e.target.value }))
            }
            placeholder="Employee, User..."
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block app-muted text-xs">From</label>
          <input
            type="datetime-local"
            value={draftFilters.from ?? ''}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, from: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block app-muted text-xs">To</label>
          <input
            type="datetime-local"
            value={draftFilters.to ?? ''}
            onChange={(e) =>
              setDraftFilters((p) => ({ ...p, to: e.target.value }))
            }
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={applyFilters}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply filters
          </button>
        </div>
      </div>

      {error && (
        <div className="app-alert-warning">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading audit logs...</p>
      ) : (
        <div className="app-table-wrap">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="app-table-head">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No audit events yet. Actions will appear here as users work
                      in the system.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className="app-table-row"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-xs">
                        {formatWhen(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {row.username ?? 'â€”'}
                        {row.role_codes && (
                          <span className="mt-0.5 block app-muted text-xs">
                            {row.role_codes}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium">{row.action}</td>
                      <td className="px-4 py-3 text-xs">
                        {row.entity_type ?? 'â€”'}
                        {row.entity_id && (
                          <span className="mt-0.5 block text-slate-500">
                            {row.entity_id}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{row.status_code ?? 'â€”'}</td>
                      <td className="max-w-xs truncate px-4 py-3 app-muted text-xs">
                        {row.summary ?? row.http_path ?? 'â€”'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <div className="border-t border-white/10 p-4 text-center">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => loadPage(nextCursor, true)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/10 disabled:opacity-60"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;

