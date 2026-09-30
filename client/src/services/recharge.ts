import type { User } from '../types/auth';
import type { ChargeRequest, ChargeResponse } from '../types/snailpay';
import { requestCharge } from './snailpayApi';
import { saveTransaction, creditBalance } from './wallet';

export type CardDetails = Omit<ChargeRequest, 'payer_id' | 'payer_email'>;

export interface RechargeResult {
  response: ChargeResponse;
  updatedUser: User | null;
}

export async function processRecharge(user: User, card: CardDetails): Promise<RechargeResult> {
  const response = await requestCharge({
    ...card,
    payer_id: user.userId,
    payer_email: user.email,
  });

  saveTransaction(response);

  if (response.status !== 'approved') {
    return { response, updatedUser: null };
  }

  const updatedUser = creditBalance(user.userId, card.amount);
  return { response, updatedUser };
}