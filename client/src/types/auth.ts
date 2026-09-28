export interface Users{
    userId: string;
    name: string;
    email: string;
    password: string;
    balance: number;
    createdAt: string;
}

export interface Sessions{
    userId: string;
    createdAt: string;
}