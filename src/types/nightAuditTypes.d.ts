export interface INightAuditResponse {
  audit_date: string;
  status: "FINISHED" | "IN_PROGRESS" | "FAILED";
  step: string;
  description: string;
  id: number;
  dependencies_to_resolve: any[];
  generated_reports: any[];
  created_at: Date;
  updated_at: Date;
}

export interface INightAuditRequest {
  property_id?: number;
  status?: string;
}

export interface INightAuditExecuteStepRequest {
  audit_date: string;
  step:
    | "CREATE_NIGHT_AUDIT"
    | "CREATE_REPORTS"
    | "FIND_REMAINING_ARRIVALS"
    | "FIND_REMAINING_DEPARTURES"
    | "POST_CHARGES"
    | "AUTHORIZE_CHARGES"
    | "SWITCH_STATUSES";
  property_id: number;
  description?: string;
}
