import type { OrganizationUnit } from '../../organization-units/types/organization-unit';
import type { CreateEmployeeInput, EmployeeCsvRow } from '../types/employee';
import { normalizeJoiningDate } from './parse-joining-date';

const REQUIRED_HEADERS = [
  'employee_code',
  'employee_name',
  'email_official',
  'employment_type',
  'ou_code',
] as const;

const parseCsvLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const normalizeHeader = (header: string) => header.trim().toLowerCase();

const parseBoolean = (value: string, fallback = true): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return ['true', '1', 'yes', 'y'].includes(normalized);
};

export const EMPLOYEE_CSV_TEMPLATE = [
  'employee_code,employee_name,email_official,email_personal,phone_number,employment_type,joining_date,ou_code,is_active',
  'EMP001,Jane Doe,jane@company.com,jane@gmail.com,+1234567890,FULL_TIME,16-01-2016,HQ,true',
].join('\n');

export const JOINING_DATE_FORMAT_HINT =
  'Joining date: YYYY-MM-DD (e.g. 2016-01-16) or DD-MM-YYYY (e.g. 16-01-2016). Leave empty if not applicable.';

export const parseEmployeeCsv = (
  content: string,
  organizationUnits: OrganizationUnit[]
): { rows: EmployeeCsvRow[]; errors: string[] } => {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV must include a header row and at least one data row.'] };
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );

  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
    };
  }

  const ouByCode = new Map(
    organizationUnits.map((unit) => [unit.code.toLowerCase(), unit])
  );

  const rows: EmployeeCsvRow[] = [];
  const errors: string[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
    const values = parseCsvLine(lines[lineIndex]);
    const rowNumber = lineIndex + 1;
    const record: Record<string, string> = {};

    headers.forEach((header, index) => {
      record[header] = values[index] ?? '';
    });

    const employee_code = record.employee_code ?? '';
    const employee_name = record.employee_name ?? '';
    const email_official = record.email_official ?? '';
    const employment_type = record.employment_type ?? '';
    const ou_code = record.ou_code ?? '';

    if (
      !employee_code ||
      !employee_name ||
      !email_official ||
      !employment_type ||
      !ou_code
    ) {
      errors.push(`Row ${rowNumber}: missing required field(s).`);
      continue;
    }

    if (!ouByCode.has(ou_code.toLowerCase())) {
      errors.push(`Row ${rowNumber}: unknown ou_code "${ou_code}".`);
      continue;
    }

    const joiningDateRaw = record.joining_date ?? '';
    const { iso: joining_date, error: joiningDateError } =
      normalizeJoiningDate(joiningDateRaw);

    if (joiningDateError) {
      errors.push(`Row ${rowNumber}: ${joiningDateError}`);
      continue;
    }

    rows.push({
      rowNumber,
      employee_code,
      employee_name,
      email_official,
      email_personal: record.email_personal ?? '',
      phone_number: record.phone_number ?? '',
      employment_type,
      joining_date: joining_date ?? '',
      ou_code,
      is_active: parseBoolean(record.is_active ?? '', true),
    });
  }

  return { rows, errors };
};

export const csvRowsToCreateInput = (
  rows: EmployeeCsvRow[],
  organizationUnits: OrganizationUnit[]
): CreateEmployeeInput[] => {
  const ouByCode = new Map(
    organizationUnits.map((unit) => [unit.code.toLowerCase(), unit.id])
  );

  return rows.map((row) => ({
    employee_code: row.employee_code,
    employee_name: row.employee_name,
    email_official: row.email_official,
    email_personal: row.email_personal || undefined,
    phone_number: row.phone_number || undefined,
    employment_type: row.employment_type,
    joining_date: row.joining_date || null,
    ou_id: ouByCode.get(row.ou_code.toLowerCase()) as string,
    is_active: row.is_active,
  }));
};
