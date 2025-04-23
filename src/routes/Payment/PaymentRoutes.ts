import express from 'express';
import { UserMiddleware } from '../../middleware/authMiddleware';
import { 
  VerifyVpayPayment, 
  HandleVpayWebhook,
  RecordPayment
} from '../../controllers/Payment/PaymentController';

const PaymentRouter = express.Router();

// Keep the original verification endpoint for backward compatibility
PaymentRouter.post('/verify-payment', UserMiddleware, VerifyVpayPayment);

// Add the simplified payment recording endpoint
PaymentRouter.post('/record-payment', UserMiddleware, RecordPayment);

// Add webhook route - no auth middleware needed for external webhooks
PaymentRouter.post('/webhook', HandleVpayWebhook);

export default PaymentRouter;
