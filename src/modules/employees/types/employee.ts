import type { OrganizationUnitRef } from '../../organization-units/types/organization-unit';

export type Employee = {
  id: string;
  employee_code: string;
  employee_name: string;
  email_official: string;
  email_personal: string | null;
  phone_number: string | null;
  employment_type: string;
  joining_date: string | null;
  ou_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  organization_unit: OrganizationUnitRef;
};

export type CreateEmployeeInput = {
  employee_code: string;
  employee_name: string;
  email_official: string;
  email_personal?: string;
  phone_number?: string;
  employment_type: string;
  joining_date?: string | null;
  ou_id: string;
  is_active?: boolean;
};

export type UpdateEmployeeInput = {
  employee_code?: string;
  employee_name?: string;
  email_official?: string;
  email_personal?: string | null;
  phone_number?: string | null;
  employment_type?: string;
  joining_date?: string | null;
  ou_id?: string;
  is_active?: boolean;
};

export type EmployeeFormValues = {
  employee_code: string;
  employee_name: string;
  email_official: string;
  email_personal: string;
  phone_number: string;
  employment_type: string;
  joining_date: string;
  ou_id: string;
  is_active: boolean;
};

export type BulkCreateEmployeeResult = {
  created: Employee[];
  failed: {
    index: number;
    employee_code: string;
    message: string;
  }[];
};

export type EmployeeCsvRow = {
  rowNumber: number;
  employee_code: string;
  employee_name: string;
  email_official: string;
  email_personal: string;
  phone_number: string;
  employment_type: string;
  joining_date: string;
  ou_code: string;
  is_active: boolean;
};
