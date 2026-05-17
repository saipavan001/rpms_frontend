import { useCallback, useEffect, useRef, useState } from 'react';

import {
  createProposalExport,
  downloadProposalExport,
  getProposalExport,
  type ProposalExportJob,
} from '../services/rpms.service';

type ExportOptions = {
  scope: 'all' | 'selected' | 'single';
  format?: 'xlsx' | 'json';
  projectIds?: string[];
};

const isTerminal = (status: ProposalExportJob['status']) =>
  status === 'COMPLETED' || status === 'FAILED';

export const useProposalExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [job, setJob] = useState<ProposalExportJob | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const triggerDownload = useCallback(async (jobId: string, fileName: string) => {
    const blob = await downloadProposalExport(jobId);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, []);

  const startExport = useCallback(
    async (options: ExportOptions) => {
      try {
        setExporting(true);
        setError('');
        setJob(null);
        stopPolling();

        const created = await createProposalExport(options);
        setJob(created);

        if (created.status === 'COMPLETED' && created.download_ready && created.file_name) {
          await triggerDownload(created.id, created.file_name);
          setExporting(false);
          return created;
        }

        await new Promise<void>((resolve, reject) => {
          pollRef.current = setInterval(async () => {
            try {
              const latest = await getProposalExport(created.id);
              setJob(latest);

              if (!isTerminal(latest.status)) {
                return;
              }

              stopPolling();

              if (latest.status === 'FAILED') {
                reject(new Error(latest.error_message ?? 'Export failed'));
                return;
              }

              if (latest.file_name) {
                await triggerDownload(latest.id, latest.file_name);
              }
              resolve();
            } catch (pollError) {
              stopPolling();
              reject(pollError);
            }
          }, 2000);
        });

        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Export failed';
        setError(message);
        throw err;
      } finally {
        setExporting(false);
      }
    },
    [stopPolling, triggerDownload]
  );

  return { startExport, exporting, error, job, setError };
};
