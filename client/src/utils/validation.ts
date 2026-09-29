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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

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