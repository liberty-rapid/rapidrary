export interface ConfirmPaymentRequest {
    userId: string;
    paymentKey: string;
    orderId: string;
    amount: number;
}
