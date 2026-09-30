import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { app } from '../src/app';

const ENDPOINT = '/api/snailpay/charges';

const validBody = {
  card_number: '1234123412341234',
  expiration_date: '12/26',
  cvv: '543',
  cardholder_name: 'Samuel Huicab',
  amount: 100,
  payer_id: 'usuario-prueba-1',
  payer_email: 'samuel@test.com',
};

const REQUIRED_FIELDS = [
  'id',
  'status',
  'status_detail',
  'transaction_amount',
  'date_created',
  'authorization_code',
  'reference',
  'payer_id',
  'payer_email',
];

describe('POST /api/snailpay/charges', () => {
  afterEach(() => {
    delete process.env.SNAILPAY_MODE;
    delete process.env.SNAILPAY_TIMEOUT_MS;
  });

  // ── Cobro exitoso ────────────────────────────────────────────────
  it('aprueba el cobro con la tarjeta de prueba válida', async () => {
    const response = await request(app).post(ENDPOINT).send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('approved');
    expect(response.body.status_detail).toBe('accredited');
    expect(response.body.transaction_amount).toBe(100);
    expect(response.body.authorization_code).toMatch(/^\d{6}$/);
    expect(response.body.payer_id).toBe(validBody.payer_id);
    expect(response.body.payer_email).toBe(validBody.payer_email);
  });

  it('incluye todos los campos obligatorios en la respuesta', async () => {
    const response = await request(app).post(ENDPOINT).send(validBody);

    for (const field of REQUIRED_FIELDS) {
      expect(response.body).toHaveProperty(field);
    }
  });

  // ── Rechazos de la tarjeta ───────────────────────────────────────
  it.each([
    { name: 'CVV incorrecto', changes: { cvv: '111' }, statusDetail: 'cc_rejected_bad_security_data' },
    { name: 'fecha incorrecta', changes: { expiration_date: '11/26' }, statusDetail: 'cc_rejected_bad_security_data' },
    { name: 'fondos insuficientes', changes: { card_number: '4000000000000051' }, statusDetail: 'cc_rejected_insufficient_funds' },
    { name: 'tarjeta rechazada', changes: { card_number: '4000000000000002' }, statusDetail: 'cc_rejected_card_declined' },
    { name: 'tarjeta no reconocida', changes: { card_number: '4111111111111111' }, statusDetail: 'cc_rejected_card_not_supported' },
  ])('rechaza el cobro: $name', async ({ changes, statusDetail }) => {
    const response = await request(app).post(ENDPOINT).send({ ...validBody, ...changes });

    expect(response.status).toBe(402);
    expect(response.body.status).toBe('rejected');
    expect(response.body.status_detail).toBe(statusDetail);
    expect(response.body.authorization_code).toBeNull();
  });

  // ── Datos inválidos ──────────────────────────────────────────────
  it.each([
    { name: 'monto negativo', changes: { amount: -500 } },
    { name: 'monto cero', changes: { amount: 0 } },
    { name: 'monto como texto', changes: { amount: '100' } },
    { name: 'mes inexistente', changes: { expiration_date: '13/26' } },
    { name: 'CVV de 2 dígitos', changes: { cvv: '54' } },
    { name: 'tarjeta corta', changes: { card_number: '1234' } },
    { name: 'nombre solo con espacios', changes: { cardholder_name: '   ' } },
    { name: 'correo inválido', changes: { payer_email: 'no-es-correo' } },
    { name: 'sin CVV', changes: { cvv: undefined } },
  ])('rechaza datos inválidos: $name', async ({ changes }) => {
    const response = await request(app).post(ENDPOINT).send({ ...validBody, ...changes });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('rejected');
    expect(response.body.status_detail).toBe('invalid_request');
    expect(response.body.message).toEqual(expect.any(String));
    expect(response.body.authorization_code).toBeNull();
  });

  // ── Errores del sistema ──────────────────────────────────────────
  it('responde error del sistema con la tarjeta de falla', async () => {
    const response = await request(app)
      .post(ENDPOINT)
      .send({ ...validBody, card_number: '4000000000000500' });

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.status_detail).toBe('service_unavailable');
  });

  it('no aprueba ni siquiera la tarjeta válida cuando el servicio está caído', async () => {
    process.env.SNAILPAY_MODE = 'down';

    const response = await request(app).post(ENDPOINT).send(validBody);

    expect(response.status).toBe(503);
    expect(response.body.status).toBe('error');
    expect(response.body.authorization_code).toBeNull();
  });

  it('responde timeout sin aprobar el cobro', async () => {
    process.env.SNAILPAY_TIMEOUT_MS = '10';

    const response = await request(app)
      .post(ENDPOINT)
      .send({ ...validBody, card_number: '4000000000000408' });

    expect(response.status).toBe(504);
    expect(response.body.status).toBe('error');
    expect(response.body.status_detail).toBe('gateway_timeout');
    expect(response.body.authorization_code).toBeNull();
  });
});