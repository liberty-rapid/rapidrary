import { Response } from "express"
import paymentService from "../../services/payment.service";

export class PaymentController {
    public confirmPayment = async (req: any, res: Response): Promise<void> => {
        const { paymentKey, orderId, amount } = req.body;

        await paymentService.confirmPayment({
            userId: req.session.userId ?? '',
            paymentKey,
            orderId,
            amount
        });

        res.status(200).sendStatus(200);
    }
}

const paymentController = new PaymentController();

export default paymentController;
