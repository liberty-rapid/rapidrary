import { isAxiosError } from "axios";
import prisma from "../clients/prisma";
import { Order, Payment, User } from "@prisma/client";

import config from "../config";
import logger from '../utils/logger';

import { ServiceError } from "../error/service-error";
import { errorConstants } from "../error/error-constants";

import { sendEmailTemplate } from '../external/zeptomail';
import tossPaymentsApi from '../external/toss-payments';

import bookService from "./book.service";

import { ConfirmPaymentRequest } from "../dto/payment.dto";

class PaymentService {
    public sendPaymentEmail = async (user: User, order: Order, payment: Payment): Promise<void> => {
        const isTestEmail = user.email.endsWith('@test.fake');

        if (isTestEmail)
            return;

        const amountFormatter = new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: payment.currency
        });

        sendEmailTemplate({
            template_alias: "order-notification",
            from: {
                address: config.email.fromAddress,
                name: "Rapidrary"
            },
            to: [
                {
                    email_address: {
                        address: user.email
                    }
                }
            ],
            merge_info: {
                orderId: order.orderId,
                purchaseDate: new Intl.DateTimeFormat(
                    'ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long', 
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: false
                    }).format(payment.approvedAt),
                productName: payment.orderName,
                price: amountFormatter.format(order.amount),
                totalAmount: amountFormatter.format(payment.totalAmount),
                paymentMethod: payment.method
            }
        }).catch(reason => {
            logger.error(reason);
        });
    }

    public confirmPayment = async (confirmation: ConfirmPaymentRequest): Promise<void> => {
        const user = await prisma.user.findFirst({
            where: {
                id: confirmation.userId
            },
            include: {
                books: true
            }
        });

        if (user === null) {
            throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
        }

        const order = await prisma.order.findFirst({
            where: {
                orderId: confirmation.orderId
            }
        });

        if (order === null) {
            throw new ServiceError(errorConstants.PAYMENT_CONFIRM_INVALID);
        }

        if (order.userId !== user.id) {
            throw new ServiceError(errorConstants.PAYMENT_CONFIRM_INVALID);
        }

        if (order.amount !== confirmation.amount) {
            throw new ServiceError(errorConstants.PAYMENT_CONFIRM_INVALID);
        }

        const book = await bookService.getBook(order.bookId);

        if (user.books.some(book => book.bookId === order.bookId)) {
            throw new ServiceError(errorConstants.PAYMENT_CONFIRM_INVALID);
        }

        if (book.price < order.amount) {
            throw new ServiceError(errorConstants.PAYMENT_CONFIRM_INVALID);
        }

        try {
            const res = await tossPaymentsApi.confirmPayment({
                paymentKey: confirmation.paymentKey,
                orderId: confirmation.orderId,
                amount: confirmation.amount
            });

            let paymentMethod = '기타';

            if (res.easyPay) {
                paymentMethod = res.easyPay.provider;
            } else if (res.card) {
                paymentMethod = '카드';
            }

            let payment: Payment;
            await prisma.$transaction(async (tx) => {
                payment = await tx.payment.create({
                    data: {
                        paymentKey: res.paymentKey,
                        approvedAt: new Date(res.approvedAt),
                        orderName: res.orderName,
                        method: paymentMethod,
                        currency: res.currency,
                        totalAmount: res.totalAmount,
                        status: res.status
                    }
                });

                await tx.order.update({
                    where: {
                        id: order.id
                    },
                    data: {
                        paymentId: payment.id
                    }
                })

                await tx.userBook.create({
                    data: {
                        userId: user.id,
                        bookId: book.id
                    }
                });
            });

            this.sendPaymentEmail(user, order, payment!);
        } catch (e) {
            if (isAxiosError(e) && e.response && e.response.data.code) {
                throw new ServiceError({
                    message: `${e.response.data.code}: ${e.response.data.message}`,
                    status: 500 <= e.response.status ? 500 : 400,
                    code: 'PAYMENT_TOSSPAYMENT_ERROR',
                });
            }

            throw e;
        }
    }
}

const orderService = new PaymentService();

export default orderService;
