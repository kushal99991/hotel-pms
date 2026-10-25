export interface IHistory {
  id: number;
  user_id: number;
  property_id: number;
  table_id: number;
  table_name: string;
  user?: {
    id: number;
    user_name: string;
  };
  user_name?: string; // Keep for backward compatibility
  category: string;
  action: string;
  details: string;
  attributes: Record<string, any>[];
  created_at: string;
  created_on: string;
}

export interface IGetHistoryParams {
  property_id: number;
  table_id?: number;
  category?: string;
  user_id?: number;
  action?: string;
  limit?: number;
  offset?: number;
}
