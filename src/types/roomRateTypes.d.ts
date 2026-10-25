export interface IRateDynamicRequest {
  start_date: string;
  end_date: string;
  room_type_ids?: string;
  rate_code_ids?: string;
  property_id: number;
}

export interface IBaseRateRequest {
  type?: string;
  rate_code_id?: string;
  room_type_id?: number;
  property_id: number;
}

export interface IRoomType {
  id: number;
  type: string;
  type_description: string;
  property_id: number;
}

export interface IRateDynamicV2Response {
  price: null;
  room_type_id: string;
  rate_code_id: string;
  room_id?: string | null;
  billing_unit: "PER_DAY" | "PER_HOUR" | "PER_HALF_HOUR";
  rate: number;
  date: string; // ISO date string, e.g., "2025-11-01"
  parent_rate?: number | null;
  parent_rate_base?: number | null;
  rate_source:
    | "OWN_DYNAMIC_RATE"
    | "OWN_BASE_RATE"
    | "PARENT_DYNAMIC_RATE"
    | "PARENT_BASE_RATE";
}

export interface IRateDynamicResponse {
  id: number;
  date: string;
  rate: string;
  room_type: IRoomType;
  rate_code_id: number;
  rateCode?: IRateCodeListResponse;
  code?: {
    description: string;
    id: number;
    name: string;
    property_id: number;
    suppressed: boolean;
    type: string;
  } | null;
}

export interface IRateCodeListResponse {
  id: number;
  name: string;
  type?: string;
  description: string;
  suppressed: boolean;
  property_id: number;
  parent_rate_code_id?: string;
  rate_plan_id?: string;
  rate_plan?: IRatePlanResponse;
  active?: boolean;
}

export interface IRoomRateRequest {
  roomType: string;
  days: string[];
  rate: number;
  rate_code_id?: number;
  billing_unit: "PER_DAY" | "PER_HOUR" | "PER_HALF_HOUR";
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface IDynamicDaywiseRequest {
  room_type_id: number;
  days: string[];
  rate: number;
  start_date: string;
  end_date: string;
  rate_code_id: number;
  billing_unit?: string;
}

export interface IAddRateCodeFormRequest {
  name: string;
  type: string;
  description: string;
  suppressed: boolean;
  property_id?: number;
  parent_rate_code_id?: string;
  rate_plan_id?: string;
  base_rate?: number;
  active?: boolean;
}

export interface IUpdateRateCodeFormRequest {
  id: number;
  name: string;
  type: string;
  description: string;
  suppressed: boolean;
  property_id?: number;
  parent_rate_code_id?: string;
  rate_plan_id?: string;
}

export interface ILinkRateCodeFormRequest {
  id?: number;
  rate_code_id: number;
  room_type_id?: number;
  rate: number;
  date: string;
}

export interface IRateCodeById {
  description: string;
  id: number;
  name: string;
  property_id: number;
  suppressed: boolean;
  active: boolean;
  type: string;
  parent_rate_code_id?: string;
  rate_plan_id?: string;
  rate_plan: IRatePlanResponse;
}

interface IRatePlanRule {
  id: number;
  rate_plan_id: number;
  rule_key: string;
  rule_value: string;
}

interface IAttachRuleRequest {
  rate_plan_id: number;
  rule_key: string;
  rule_value: string;
}

// Typed rules interface
interface ITypedRules {
  min_stay: number;
  allow_to_extend_stay: boolean;
  breakfast_included: boolean;
  suppressed_rates: boolean;
  parking_included: boolean;
  [key: string]: boolean | number | string; // For potential additional rules
}

// Rate Plan response interface
export interface IRatePlanResponse {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  property_id: number;
  active?: boolean;
  rules?: IRatePlanRule[];
  typed_rules?: ITypedRules;
}

export interface IRatePlanRequest {
  name: string;
  description: string;
  property_id: number;
  start_date?: string;
  end_date?: string;
}

export interface IDynamicDaywiseDeleteRequest {
  start_date: string;
  end_date: string;
  room_type_id: number;
  rate_code_id: number;
  days?: string[];
  room_id?: number;
  billing_unit?: string;
}
