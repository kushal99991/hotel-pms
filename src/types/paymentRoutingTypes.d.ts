import { FolioTypes } from "constants/folios";

export interface PaymentRouting {
  folio: FolioTypes;
  routing_targets: RoutingTarget[];
  target_dept_group: SimpleTargetDeptGroup;
}

interface RoutingTarget {
  posting_code_department_id: number;
}

interface SimpleTargetDeptGroup {
  name: string;
}
