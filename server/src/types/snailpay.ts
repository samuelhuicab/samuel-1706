import type { z } from 'zod';
import type { chargeRequestSchema } from '../validation/snailpay.schema';

export type ChargeStatus = 'approved' | 'rejected' | 'error';

export type ChargeStatusDetail =
  | 'accredited'
  | 'invalid_request'
  | 'cc_rejected_bad_security_data'
  | 'cc_rejected_insufficient_funds'
  | 'cc_rejected_card_declined'
  | 'cc_rejected_card_not_supported'
  | 'service_unavailable'
  | 'gateway_timeout';


export type ChargeRequest = z.infer<typeof chargeRequestSchema>;

export interface ChargeResponse {
  id: string;
  status: ChargeStatus;
  status_detail: ChargeStatusDetail;
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