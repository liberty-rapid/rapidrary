import { EmailAuthentication } from "./auth.dto";

export interface UserResponse {
    id: string;
    createdAt: Date;
    email: string;
    oauthAccounts: { provider: string }[]
    displayName: string;
    books: string[];
}

export interface UserPaymentResponse {
    orderId: string;
    approvedAt: Date;
    orderName: string;
    method: string;
    currency: string;
    totalAmount: number;
    status: string;
}

export interface UpdateEmailRequest {
    userId: string;
    authentication: EmailAuthentication;
}

export interface UpdateDisplayNameRequest {
    userId: string;
    displayName: string;
}
