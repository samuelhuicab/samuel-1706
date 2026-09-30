import type { User } from '../types/auth';
import type { ChargeResponse } from '../types/snailpay';
import { getTransactions, saveTransactions, getUsers, saveUsers } from './storage';
import { addAmounts } from '../utils/money';

export function saveTransaction(transaction: ChargeResponse): void {
  saveTransactions([...getTransactions(), transaction]);
}

export function creditBalance(userId: string, amount: number): User {

    const users = getUsers();
    const user = users.find( u => u.userId === userId);

    if (!user){
        throw new Error('Usuario no encontrado.');
    }

    const currentBalance = user.balance;
    const newBalance = addAmounts(currentBalance, amount);

    const updatedUser: User = { ...user, balance: newBalance };

    saveUsers(users.map((u) => (u.userId === userId ? updatedUser : u)));

    return updatedUser;
}