import { formatCurrency } from "./format";

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface RechargeFormValues {
  cardholderName: string;
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  amount: string;
}

export interface RechargeFormErrors {
  cardholderName?: string;
  cardNumber?: string;
  expirationDate?: string;
  cvv?: string;
  amount?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;
const MAX_AMOUNT = 10000;

export function validateRegisterForm(values: RegisterFormValues): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  // Nombre
  if (values.name.trim().length < MIN_NAME_LENGTH) {
    errors.name = `Escribe tu nombre completo (mínimo ${MIN_NAME_LENGTH} caracteres).`;
  }

  // Correo
  if (!values.email.trim()) {
    errors.email = 'Escribe tu correo electrónico.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Escribe un correo válido, por ejemplo: nombre@correo.com.';
  }

  // Contraseña
  const hasMinLength = values.password.length >= MIN_PASSWORD_LENGTH;
  const hasLetter = /[A-Za-z]/.test(values.password);
  const hasNumber = /\d/.test(values.password);

  if (!hasMinLength || !hasLetter || !hasNumber) {
    errors.password = `Usa mínimo ${MIN_PASSWORD_LENGTH} caracteres, con al menos una letra y un número.`;
  }

  // Confirmación
  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirma tu contraseña.';
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Las contraseñas no coinciden.';
  }

  return errors;
}

export function validateRechargeForm(values: RechargeFormValues): RechargeFormErrors {
  const errors: RechargeFormErrors = {};

  if (!values.cardholderName.trim()){
    errors.cardholderName = 'El nombre de la tajeta no debe estar vacío.';
  }

  if (!/^\d{16}$/.test(values.cardNumber.replace(/\s/g, ''))){
    errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expirationDate.trim())){
    errors.expirationDate = 'La fecha de vencimiento debe tener el formato MM/AA.'
  }

  if (!/^\d{3}$/.test(values.cvv.trim())){
    errors.cvv = 'El CVV debe tener 3 dígitos.';
  }
  
  const amount = Number(values.amount);

  if (!/^\d+(\.\d{1,2})?$/.test(values.amount.trim()) || amount <= 0) {
    errors.amount = 'Escribe un monto mayor que cero, con máximo dos decimales.';
  } else if (amount > MAX_AMOUNT) {
    errors.amount = `El monto máximo por recarga es de ${formatCurrency(MAX_AMOUNT)}.`;
  }


  return errors;
}