import type { ChargeRequest, ChargeResponse } from '../types/snailpay';

const CHARGE_ENDPOINT = '/api/snailpay/charges';
export const REQUEST_TIMEOUT_MS = 4_000;

export async function requestCharge(payload: ChargeRequest): Promise<ChargeResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CHARGE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    return (await response.json()) as ChargeResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('SnailPay tardó demasiado en responder. No se realizó ningún cobro. Intenta de nuevo.');
    }
    throw new Error('No pudimos conectar con SnailPay. Revisa tu conexión e intenta de nuevo.');
  } finally {
    clearTimeout(timeoutId);
  }
}