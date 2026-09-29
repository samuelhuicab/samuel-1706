import { z } from 'zod';

export const MAX_CHARGE_AMOUNT = 10_000;

export const chargeRequestSchema = z.object({
  card_number: z
    .string({ error: 'El número de tarjeta es obligatorio.' })
    .regex(/^\d{16}$/, 'El número de tarjeta debe tener 16 dígitos.'),

  expiration_date: z
    .string({ error: 'La fecha de vencimiento es obligatoria.' })
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'La fecha de vencimiento debe tener el formato MM/AA.'),

  cvv: z
    .string({ error: 'El CVV es obligatorio.' })
    .regex(/^\d{3}$/, 'El CVV debe tener 3 dígitos.'),

  cardholder_name: z
    .string({ error: 'El nombre del titular es obligatorio.' })
    .trim()
    .min(1, 'El nombre del titular es obligatorio.'),

  amount: z
    .number({ error: 'El monto debe ser un número.' })
    .positive('El monto debe ser mayor que cero.')
    .max(MAX_CHARGE_AMOUNT, `El monto máximo por recarga es de ${MAX_CHARGE_AMOUNT}.`),

  payer_id: z
    .string({ error: 'El identificador del usuario es obligatorio.' })
    .min(1, 'El identificador del usuario es obligatorio.'),

  payer_email: z.email({ error: 'El correo del usuario no es válido.' }),
});