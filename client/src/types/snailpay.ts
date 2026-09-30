export type ChargeStatus = 'approved' | 'rejected' | 'error';

export interface ChargeRequest {
  card_number: string;
  expiration_date: string;
  cvv: string;
  cardholder_name: string;
  amount: number;
  payer_id: string;
  payer_email: string;
}

export interface ChargeResponse {
  id: string;
  status: ChargeStatus;
  status_detail: string;
  message: string;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
}