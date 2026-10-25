export interface IAccountReceivables {
  id: number;
  balance: number;
  aging: number;
  balance_30_0: number;
  balance_60_30: number;
  balance_90_60: number;
  reservation_id?: number;
  direct_billing_account_id?: number;
  direct_billing_account: {
    billing_name: string;
  };
  reservation?: {
    id: number;
    reservation_holder_info: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      phone?: string;
      cell_phone?: string;
      country?: string;
      address?: string;
    };
  };
}
