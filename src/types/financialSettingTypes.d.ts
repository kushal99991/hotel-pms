import { PostingCodeTypes } from "constants/payments";
import { TaxAssignmentType, TaxOccurence, TaxRateType } from "constants/taxes";

export interface IGetTaxParams {
  property_id: number;
  id?: number;
  name?: string;
  active?: boolean;
  posting_code_id?: number;
  type?: TaxRateType;
  assignment_type?: TaxOccurence;
  occurence?: TaxAssignmentType;
}

export interface ITaxTypes {
  id?: number;
  name: string;
  rate: string;
  description: string;
  posting_department: string;
  starts_from: Date;
  type: TaxRateType;
  posting_code_id: number;
  active: boolean;
  tax_id?: number;
  versions?: ITaxVersion[];
  posting_code?: {
    name: string;
    code: number;
    posting_code_department_id: number;
    id: number;
    description: string | null;
  } | null;
  posting_code_departments?: {
    posting_code_department: {
      name: string;
      code: number;
      id: number;
    };
    inc_posting_codes: {
      name: string;
      code: number;
      posting_code_department_id: number;
      description: string;
      id: number;
    }[];
    exc_posting_codes: {
      name: string;
      code: number;
      posting_code_department_id: number;
      description: string;
      id: number;
    }[];
  }[];
  assignment_type?: "AUTO_APPLIED" | "MANUALLY_ADDED";
  occurrence?: "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON";
  taxable?: boolean;
}

export interface ITaxTypesRequest {
  property_id: number;
  id?: number;
  type?: string;
  name?: string;
  active?: boolean;
  posting_code_id?: string;
}

export interface IEditTaxTypes {
  id?: number;
  name: string;
  rate?: string;
  description: string;
  posting_department: string;
  starts_from?: Date;
  type: TaxRateType;
  posting_code_id: number;
  active: boolean;
  tax_id?: number;
  versions?: ITaxVersion[];
  assignment_type?: "AUTO_APPLIED" | "MANUALLY_ADDED";
  occurrence?: "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON";
  taxable?: boolean;
}

export interface ITaxByIDTypes {
  id: number; // Made non-optional as the response always includes an 'id'
  name: string;
  rate: string; // Kept optional as it is not present in the new API response
  description: string; // Adjusted to allow null values
  starts_from: Date; // Kept optional as it's not part of the new response
  type: TaxRateType;
  posting_code_id: number;
  active: boolean;
  property_id: number; // Added based on the new API response
  versions: ITaxVersion[]; // Added based on the new API response
  posting_code_departments: PostingCodeDepartment[]; // Added based on the new API response
  posting_code: {
    // Added based on the nested structure
    name: string;
    code: number;
    posting_code_department_id: number;
    description: string | null;
    id: number;
  };
  assignment_type?: "AUTO_APPLIED" | "MANUALLY_ADDED";
  occurrence?: "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON";
  taxable?: boolean;
}
export interface PostingCodeDepartment {
  posting_code_department: {
    name: string;
    code: number;
    id: number;
  };
  inc_posting_codes: {
    name: string;
    code: number;
    posting_code_department_id: number;
    description: string;
    id: number;
  }[];
  exc_posting_codes: {
    name: string;
    code: number;
    posting_code_department_id: number;
    description: string;
    id: number;
  }[];
}

interface IBaseFeeType {
  id?: number;
  name: string;
  rate?: string; // You may want to use `number` if `rate` should be numeric.
  description: string;
  starts_from?: Date;
  fee_id?: number;
  active?: boolean;
  posting_department: string;
  taxable?: boolean;
  occurrence: string;
  property_id?: number;
  posting_code_id: number;
  posting_code_departments?: PostingCodeDepartment[]; // Added based on the new API response
  versions?: IFeeVersion[];
  posting_code?: {
    name: string;
    code: number;
    posting_code_department_id: number;
    description: string | null;
    id: number;
  };
}

export interface ICreateFeesTypes extends IBaseFeeType {
  rate: string;
  starts_from: Date;
}

// rename for convenience
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IFeesTypes extends IBaseFeeType {}

export interface ITaxVersion {
  tax_id: number;
  rate: string;
  starts_from: string; // ISO date string
  id: number;
}

export interface IFeeVersion {
  fee_id: number;
  rate: string;
  starts_from: string; // ISO date string
  id: number;
}

export interface IPostingCodeDept {
  id: number;
  name: string;
  code: string;
}

// Define a separate interface for the form inputs
export interface IPostingCodeFormInputs {
  name: string;
  code: string;
  description?: string | null;
  posting_code_department_id: number;
  type: string;
  adjustment: boolean;
  is_active?: boolean;
}

export interface IPostingCode {
  id: number;
  name: string;
  code: string;
  description: string;
  posting_code_department_id: number;
  type: PostingCodeTypes;
  adjustment: boolean;
  is_active?: boolean;
}

export interface IPostingCodeRequest {
  id?: number;
  posting_code_department_id?: number;
  name?: string;
  code?: string;
  type?: string;
  property_id?: number;
}

export interface IPostingCodeDeptRequest {
  property_id?: number;
}

export interface IAddTaxRequest {
  name: string;
  rate: string;
  description: string;
  starts_from: string;
  posting_code_id?: number;
  property_id: number;
  type: string;
  active: boolean;
}
export interface IUpdateTaxRequest {
  id?: number;
  name: string;
  rate?: string;
  description: string;
  starts_from?: string;
  posting_code_id?: number;
  property_id: string;
  type: string;
  active: boolean;
  assignment_type?: "AUTO_APPLIED" | "MANUALLY_ADDED";
  occurrence?: "PER_NIGHT" | "PER_RESERVATION" | "PER_ROOM" | "PER_PERSON";
  taxable?: boolean;
}

export interface IAddFeeRequest {
  name: string;
  rate: string;
  description: string;
  starts_from: string;
  occurrence: string;
  active?: boolean;
  taxable?: boolean;
  occurrence?: string;
  property_id?: number;
  posting_department: string;
  posting_code_id?: number;
}

export interface IUpdateFeeRequest {
  id?: number;
  name: string;
  rate?: string;
  description: string;
  starts_from?: string;
  occurrence: string;
  posting_code_id?: number;
  property_id: string;
  active: boolean;
  taxable?: boolean;
}

export interface ApplicableTaxParams {
  property_id: number;
  rate_code_id: number;
  date: string;
  posting_code_id?: number;
}

// Tax Exemption Option interface for /taxes/tax_exemptions/list
export interface ITaxExemptionOption {
  id: number;
  property_id: number;
  reason: string;
  coverage: string;
}
