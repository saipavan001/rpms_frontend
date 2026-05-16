import { useState } from 'react';

import type { OrganizationUnit } from '../../organization-units/types/organization-unit';
import { bulkCreateEmployees } from '../services/employee.service';
import type { BulkCreateEmployeeResult, EmployeeCsvRow } from '../types/employee';
import {
  csvRowsToCreateInput,
  EMPLOYEE_CSV_TEMPLATE,
  JOINING_DATE_FORMAT_HINT,
  parseEmployeeCsv,
} from '../utils/parse-employee-csv';

type EmployeeBulkUploadModalProps = {
  organizationUnits: OrganizationUnit[];
  loading?: boolean;
  onClose: () => void;
  onComplete: (result: BulkCreateEmployeeResult) => void;
};

const EmployeeBulkUploadModal = ({
  organizationUnits,
  loading = false,
  onClose,
  onComplete,
}: EmployeeBulkUploadModalProps) => {
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<EmployeeCsvRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDownloadTemplate = () => {
    const blob = new Blob([EMPLOYEE_CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_bulk_upload_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    const content = await file.text();
    const { rows, errors } = parseEmployeeCsv(content, organizationUnits);
    setPreviewRows(rows);
    setParseErrors(errors);
  };

  const handleUpload = async () => {
    if (previewRows.length === 0) {
      setParseErrors(['Add a valid CSV file with at least one employee row.']);
      return;
    }

    try {
      setUploading(true);
      const employees = csvRowsToCreateInput(previewRows, organizationUnits);
      const result = await bulkCreateEmployees(employees);
      onComplete(result);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="app-modal-overlay">
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-2xl border border-white/10 bg-slate-900 shadow-2xl sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between app-sidebar-brand border-b px-4 py-4 sm:px-6">
          <h2 className="pr-4 app-heading text-lg sm:text-xl">
            Bulk upload employees
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="app-btn-icon flex h-9 w-9 shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-4">
            <p className="app-muted text-sm">
              Upload a CSV with columns: employee_code, employee_name,
              email_official, email_personal, phone_number, employment_type,
              joining_date, ou_code, is_active. Organization unit codes must
              already exist. {JOINING_DATE_FORMAT_HINT}
            </p>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Download template
              </button>
              <label className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-2.5 app-label text-sm hover:bg-white/10">
                {fileName || 'Choose CSV file'}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {parseErrors.length > 0 && (
              <div className="app-alert-warning">
                <ul className="list-disc space-y-1 pl-5">
                  {parseErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {previewRows.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="app-table-head">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">OU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className="app-table-row"
                        >
                          <td className="px-3 py-2">{row.rowNumber}</td>
                          <td className="px-3 py-2 font-mono">
                            {row.employee_code}
                          </td>
                          <td className="px-3 py-2">{row.employee_name}</td>
                          <td className="px-3 py-2">{row.email_official}</td>
                          <td className="px-3 py-2">{row.ou_code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="border-t border-white/10 px-3 py-2 app-muted text-xs">
                  {previewRows.length} row(s) ready to upload
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex shrink-0 flex-col-reverse gap-3 app-divider border-t pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="app-btn-secondary w-full px-4 py-3 text-sm sm:w-auto sm:py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={loading || uploading || previewRows.length === 0}
              className="app-btn-primary w-full px-4 py-3 text-sm sm:w-auto sm:py-2"
            >
              {uploading ? 'Uploading...' : 'Upload employees'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeBulkUploadModal;
