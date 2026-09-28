export interface User{
    userId: string;
    name: string;
    email: string;
    passwordHash: string;
    balance: number;
    createdAt: string;
}

export interface Session{
    userId: string;
    createdAt: string;
}