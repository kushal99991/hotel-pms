import { INightAuditResponse } from "types/nightAuditTypes";

export function nightAuditDateTime(audit: INightAuditResponse): string {
  return `${audit.updated_at}Z`;
}
