import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import TextField from '../ui/TextField';
import { validateRechargeForm, type RechargeFormErrors } from '../../utils/validation';
import { formatCurrency } from '../../utils/format';

type RechargeFeedback =
  | { kind: 'success'; message: string; reference: string; authorizationCode: string | null }
  | { kind: 'error'; message: string };

interface RechargeFormProps {
  onClose: () => void;
}

function RechargeForm({ onClose }: RechargeFormProps) {
  const { recharge } = useAuth();

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('');

  const [errors, setErrors] = useState<RechargeFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<RechargeFeedback | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    const validationErrors = validateRechargeForm({
      cardholderName,
      cardNumber,
      expirationDate,
      cvv,
      amount,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await recharge({
        card_number: cardNumber.replace(/\s/g, ''),
        expiration_date: expirationDate.trim(),
        cvv: cvv.trim(),
        cardholder_name: cardholderName.trim(),
        amount: Number(amount),
      });

      if (response.status === 'approved') {
        setFeedback({
          kind: 'success',
          message: `Recarga de ${formatCurrency(Number(amount))} aprobada.`,
          reference: response.reference,
          authorizationCode: response.authorization_code,
        });
        setCardNumber('');
        setExpirationDate('');
        setCvv('');
        setAmount('');
      } else {
        setFeedback({ kind: 'error', message: response.message });
      }
    } catch (error) {
      setFeedback({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <h2 className="mb-4 text-lg font-semibold">Recargar con SnailPay</h2>

      <form noValidate onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField
            id="cardholderName"
            label="Nombre del titular"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            autoComplete="cc-name"
            error={errors.cardholderName}
          />
        </div>

        <div className="sm:col-span-2">
          <TextField
            id="cardNumber"
            label="Número de tarjeta"
            inputMode="numeric"
            placeholder="1234 1234 1234 1234"
            maxLength={19}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            autoComplete="cc-number"
            error={errors.cardNumber}
          />
        </div>

        <TextField
          id="expirationDate"
          label="Vencimiento"
          placeholder="MM/AA"
          maxLength={5}
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          autoComplete="cc-exp"
          error={errors.expirationDate}
        />

        <TextField
          id="cvv"
          label="CVV"
          type="password"
          inputMode="numeric"
          maxLength={3}
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          autoComplete="cc-csc"
          error={errors.cvv}
        />

        <div className="sm:col-span-2">
          <TextField
            id="amount"
            label="Monto a recargar (MXN)"
            inputMode="decimal"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
        </div>

        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className={`sm:col-span-2 rounded-lg px-4 py-3 text-sm ${
              feedback.kind === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'
            }`}
          >
            <p className="font-medium">{feedback.message}</p>
            {feedback.kind === 'success' && (
              <p className="mt-1 text-xs">
                Referencia {feedback.reference}
                {feedback.authorizationCode && ` · Autorización ${feedback.authorizationCode}`}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-gray-300 px-4 py-2 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-black px-4 py-2 text-white hover:bg-gray-800 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Procesando...' : 'Recargar'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default RechargeForm;