import prisma from "../clients/prisma";

import { ServiceError } from "../error/service-error";
import { errorConstants } from "../error/error-constants";

import bookService from './book.service';

import { CreateOrderRequest } from "../dto/order.dto";

class OrderService {
    public createOrder = async (request: CreateOrderRequest): Promise<void> => {
        const user = await prisma.user.findFirst({
            where: {
                id: request.userId
            },
            include: {
                books: true
            }
        });

        if (user === null) {
            throw new ServiceError(errorConstants.COMMON_UNAUTHORIZED);
        }

        const book = await bookService.getBook(request.bookId);

        if (book.price === 0) {
            throw new ServiceError(errorConstants.BOOK_NOT_FOUND);
        }

        if (book.price !== request.amount) {
            throw new ServiceError(errorConstants.ORDER_INVALID);
        }

        if (user.books.some(b => b.bookId === book.id)) {
            throw new ServiceError(errorConstants.ORDER_INVALID);
        }

        const foundOrder = await prisma.order.findFirst({
            where: {
                orderId: request.orderId
            }
        });

        if (foundOrder !== null) {
            throw new ServiceError(errorConstants.ORDER_INVALID);
        }

        if (book.price < 100) {
            throw new ServiceError(errorConstants.ORDER_INVALID);
        }

        await prisma.order.create({
            data: {
                orderId: request.orderId,
                name: book.title,
                amount: request.amount,
                userId: request.userId,
                bookId: request.bookId
            }
        });
    }
}

const orderService = new OrderService();

export default orderService;
