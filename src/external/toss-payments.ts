import axios, { AxiosRequestConfig } from "axios";

import config from "../config";

export async function confirmPayment(params: { paymentKey: string, orderId: string, amount: number }): Promise<any> {
    const secretKey = config.tossPayments.secretKey;

    const requestConfig: AxiosRequestConfig = {
        method: 'post',
        url: 'https://api.tosspayments.com/v1/payments/confirm',
        headers: { 
          'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(params),
        timeout: 30 * 1000
    };

    const response = await axios(requestConfig);

    return response.data;
}

export default {
    confirmPayment
};
