export type UpdateInventoryParams = {
  start_date: string;
  end_date: string;
  available_count: number;
  rate_code_id: number;
  room_type_id: number;
};

export type UpdateInventoryIntervalBody = {
  intervals: UpdateInventoryParams[];
};

export type DeleteInventoryParams = {
  start_date: string;
  end_date: string;
  rate_code_ids: string;
  room_type_ids: string;
};

export type DeleteInventoryIntervalBody = {
  intervals: DeleteInventoryParams[];
};

export type GetInventoryParams = {
  property_id: number;
  start_date: string;
  end_date: string;
  rate_code_ids?: string;
  room_type_ids?: string;
};

export type InventoryItem = {
  room_type_id: number;
  rate_code_id: number;
  date: string;
  reserved_count: number;
  available_count: number;
  block_count: number;
  limit_count: number;
  overall_inventory_count: number;
};
