import { Response } from "express"

import orderService from "../../services/order.service";

export class OrderController {
    public createOrder = async (req: any, res: Response): Promise<void> => {
        const { orderId, bookId, amount } = req.body;

        await orderService.createOrder({
            userId: req.session.userId ?? '',
            orderId,
            bookId,
            amount
        });            

        res.sendStatus(200);
    }
}

const orderController = new OrderController();

export default orderController;
