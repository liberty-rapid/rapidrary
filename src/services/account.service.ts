import prisma from '../clients/prisma';

import { ServiceError } from '../error/service-error';
import { errorConstants } from '../error/error-constants';

import authService from './auth.service';

import { UpdateDisplayNameRequest, UpdateEmailRequest, UserPaymentResponse, UserResponse } from '../dto/account.dto';

class AccountService {
    public checkEmail = async (email: string): Promise<boolean> => {
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        });

        return user !== null;
    }

    public getMyInfo = async (userId: string): Promise<UserResponse | null> => {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            },
            include: {
                books: true,
                oauthAccounts: true
            }
        });

        if (user === null) {
            return null;
        }

        return {
            ...user,
            books: user.books.map(book => book.bookId),
            oauthAccounts: user.oauthAccounts.map(account => ({
                provider: account.provider
            }))
        }
    }

    public getMyPayments = async (userId: string): Promise<UserPaymentResponse[]> => {
        const user = await prisma.user.findFirst({
            where: {
                id: userId
            }
        });

        if (user === null) {
            throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                payment: true
            }
        });

        return orders.filter(order => order.payment).map(order => {
            const { paymentKey, createdAt, id, ...dto } = order.payment!;

            return { ...dto, orderId: order.orderId };
        });
    }

    public updateMyEmail = async (request: UpdateEmailRequest): Promise<void> => {
        await authService.verifyCode(request.authentication);

        const user = await prisma.user.findFirst({
            where: {
                id: request.userId
            }
        });

        if (user === null) {
            throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
        }

        const emailUser = await prisma.user.findFirst({
            where: {
                email: request.authentication.email
            }
        });

        if (emailUser !== null) {
            throw new ServiceError(errorConstants.COMMON_BAD_REQUEST);
        }

        await prisma.user.update({
            where: {
                id: request.userId
            },
            data: {
                email: request.authentication.email
            }
        });
    }

    public updateMyDisplayName = async (request: UpdateDisplayNameRequest): Promise<void> => {
        const user = await prisma.user.findFirst({
            where: {
                id: request.userId
            }
        });

        if (user === null) {
            throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
        }

        await prisma.user.update({
            where: {
                id: request.userId
            },
            data: {
                displayName: request.displayName
            }
        });
    }

    public deleteMyAccount = async (userId: string): Promise<void> => {
        try {
            await prisma.user.delete({
                where: {
                    id: userId
                }
            });            
        } catch (e: any) {
            if (e.code === 'P2025') {
                throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
            } else {
                throw e;
            }
        }
    }
}

const accountService = new AccountService();

export default accountService;
