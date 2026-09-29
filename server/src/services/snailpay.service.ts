import { randomUUID } from 'node:crypto';
import { chargeRequestSchema } from '../validation/snailpay.schema';
import type {
  ChargeRequest,
  ChargeResponse,
  ChargeStatus,
  ChargeStatusDetail,
} from '../types/snailpay';


export const APPROVED_CARD = {
  number: '1234123412341234',
  expirationDate: '12/26',
  cvv: '543',
} as const;

export const TEST_CARDS = {
  SYSTEM_ERROR: '4000000000000500',
  TIMEOUT: '4000000000000408',
  INSUFFICIENT_FUNDS: '4000000000000051',
  DECLINED: '4000000000000002',
} as const;

export const TIMEOUT_DELAY_MS = 10_000;

export interface ChargeResult {
  httpStatus: number;
  body: ChargeResponse;
}

interface BuildResultParams {
  httpStatus: number;
  status: ChargeStatus;
  statusDetail: ChargeStatusDetail;
  message: string;
  request: ChargeRequest | null;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateAuthorizationCode(): string {
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

function isServiceDown(): boolean {
  return process.env.SNAILPAY_MODE === 'down';
}

function buildResult({ httpStatus, status, statusDetail, message, request }: BuildResultParams): ChargeResult {
  const id = randomUUID();

  return {
    httpStatus,
    body: {
      id,
      status,
      status_detail: statusDetail,
      message,
      transaction_amount: request?.amount ?? null,
      date_created: new Date().toISOString(),
      authorization_code: status === 'approved' ? generateAuthorizationCode() : null,
      reference: `SP-${id.slice(0, 8).toUpperCase()}`,
      payer_id: request?.payer_id ?? null,
      payer_email: request?.payer_email ?? null,
      card_number: request?.card_number ?? null,
      cvv: request?.cvv ?? null,
    },
  };
}


export async function processCharge(body: unknown): Promise<ChargeResult> {

    if (isServiceDown()) {
        return buildResult({
            httpStatus: 503,
            status: 'error',
            statusDetail: 'service_unavailable',
            message: 'SnailPay no está disponible en este momento. No se realizó ningún cobro. Intenta más tarde.',
            request: null,
        });
    }

    const validation = chargeRequestSchema.safeParse(body);

    if (!validation.success) {
        return buildResult({
            httpStatus: 400,
            status: 'rejected',
            statusDetail: 'invalid_request',
            message: validation.error.issues[0]?.message ?? 'Los datos enviados no son válidos.',
            request: null,
        });
    }

    const request = validation.data;

    if (request.card_number === TEST_CARDS.SYSTEM_ERROR) {
        return buildResult({
            httpStatus: 503,
            status: 'error',
            statusDetail: 'service_unavailable',
            message: 'SnailPay tuvo un problema interno y no pudo procesar tu recarga. No se realizó ningún cobro. Intenta más tarde.',
            request,
        });
    }


    if (request.card_number === TEST_CARDS.TIMEOUT) {

        await wait(TIMEOUT_DELAY_MS);

        return buildResult({
            httpStatus: 504, 
            status: 'error', 
            statusDetail: 'gateway_timeout', 
            message: 'SnailPay tardó demasiado en responder. No se realizó ningún cobro. Intenta más tarde.', 
            request
        })
    }
  

    if (request.card_number === TEST_CARDS.INSUFFICIENT_FUNDS) {
        return buildResult({
            httpStatus: 402, 
            status: 'rejected', 
            statusDetail: 'cc_rejected_insufficient_funds', 
            message: 'La tarjeta no cuenta con los fondos suficientes para completar la transacción. Intenta con otra tarjeta.', 
            request
        });
    }


    if (request.card_number === TEST_CARDS.DECLINED) {
        return buildResult({
            httpStatus: 402, 
            status: 'rejected', 
            statusDetail: 'cc_rejected_card_declined', 
            message: 'El banco ha rechazado la operación. Intenta con otra tarjeta.', 
            request
        });
    }


    if (request.card_number === APPROVED_CARD.number) {

        if (request.cvv === APPROVED_CARD.cvv && request.expiration_date === APPROVED_CARD.expirationDate){
            return buildResult({
                httpStatus: 201, 
                status: 'approved', 
                statusDetail: 'accredited', 
                message: 'Recarga aprobada. Tu saldo se actualizó.', 
                request
            });
        }

        return buildResult({
            httpStatus: 402, 
            status: 'rejected', 
            statusDetail: 'cc_rejected_bad_security_data', 
            message: 'La fecha de vencimiento o el CVV no coinciden con la tarjeta. Revísalos e intenta de nuevo.', 
            request
        });
    }


    return buildResult({
        httpStatus: 402, 
        status: 'rejected', 
        statusDetail: 'cc_rejected_card_not_supported', 
        message: 'SnailPay no reconoce esta tarjeta. Revisa el número o usa otra tarjeta.', 
        request
    });
}