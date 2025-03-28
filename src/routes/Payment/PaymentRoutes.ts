import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { VerifyVpayPayment } from '../../controllers/Payment/PaymentController';
const PaymentRouter = express.Router();

PaymentRouter.post('/verify-payment',UserMiddleware, VerifyVpayPayment );

export default PaymentRouter