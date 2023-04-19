export interface Transaction {
  uid: string;
  status: string;
  external_status: string;
  ip_address: string;
  call_back_url: string;
  description: string;
  action: string;
  kind: string;
  amount: string;
  fee: string;
  currency: string;
  card_pan: string;
  provider: string;
  is_test: true,
  success_at: Date;
  refund_at: Date;
  created_at: Date;
  updated_at: Date;
  card_creds: [];
}
