import bcrypt from 'bcryptjs';
import type { User } from '../types/auth';
import { getUsers, saveUsers, saveSession, removeSession, getSession } from './storage';
const INVALID_CREDENTIALS_ERROR = 'Usuario o contraseña incorrectos. Por favor, verifica tus credenciales e inténtalo nuevamente.';

// Funcion para registrar a los usuarios
export async function registerUser(name: string, email: string, password: string): Promise<User> {

    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();

    const userExists = users.some(u => u.email === normalizedEmail);
    if (userExists) {
        throw new Error('El correo ingresado ya está registrado en la plataforma. Por favor, utiliza otro correo electrónico.');
    }

    const pwdHash = await bcrypt.hash(password, 10);

    const newUser: User = {
        userId: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: pwdHash,
        balance: 0,
        createdAt: new Date().toISOString()
    }

    saveUsers([...users, newUser]);
    saveSession({ userId: newUser.userId, createdAt: new Date().toISOString() });

    return newUser;

}


// Funcion para iniciar sesión con los usuarios
export async function loginUser(email: string, password: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();
    const users = getUsers();


    const user = users.find(u => u.email === normalizedEmail);
    if (!user) {
        throw new Error(INVALID_CREDENTIALS_ERROR);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error(INVALID_CREDENTIALS_ERROR);
    }

    saveSession({ userId: user.userId, createdAt: new Date().toISOString() });

    return user;
}

// Funcion para obtener el usuario actual
export function getCurrentUser(): User | null {
    const session = getSession();
    if (!session) return null;

    const users = getUsers();
    return users.find(u => u.userId === session.userId) || null;
}

// Funcion para cerrar sesión del usuario
export function logoutUser(): void {
    removeSession();
}