import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { VerifyPaymentInterface } from "../../types/Payment";
import { PaymentValidationSchema } from "./PaymentValidation";
import { VerifyPayment } from "./VpayService";
import Consultation from "../../models/Consultation";
import ConsultationType from "../../models/ConsultationType";
import Transaction from "../../models/Transaction";

export const VerifyVpayPayment = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { transactionRef, reason, consultation_id }: VerifyPaymentInterface =
      req.body;
    const { error } = PaymentValidationSchema.validate(req.body);
    if (error)
      return errorResponse(
        res,
        `Validation error: ${error.details[0].message}`,
        { error: error.details[0].message },
        400
      );
    const { user_id } = req.user!;
    if (!user_id) {
      return errorResponse(res, "user Id is required", {}, 400);
    }
    //call the verify payment service
    const verify = await VerifyPayment(transactionRef);
    console.log("verify", verify);
    if (!verify || !verify.data || verify.data.paymentstatus !== "paid") {
      return errorResponse(res, "Payment not completed", {}, 400);
    }
    
    // Save transaction details
    const transaction = new Transaction({
      user_id,
      transactionRef,
      paymentmethod: verify.data.paymentmethod,
      status: verify.data.paymentstatus,
      amount: verify.data.orderamount,
      reversed: verify.data.reversed,
    });
    await transaction.save();

    // Retrieve consultation details if reason is "consultation"
    if (reason === "consultation") {
      // Retrieve the consultation with its type information
      const consult = await Consultation.findById(consultation_id).populate('consultation_type_id');
      
      if (!consult) {
        return errorResponse(res, "Consultation not found", {}, 404);
      }
      
      if (!consult.consultation_type_id) {
        return errorResponse(res, "Consultation type not found", {}, 404);
      }

      // Get the price from the consultation type
      const expectedAmount = (consult.consultation_type_id as any).price;
      
      // Compare the expected amount with the paid amount
      if (verify.data.orderamount !== expectedAmount) {
        return errorResponse(
          res,
          "Incorrect payment amount",
          { transaction },
          400
        );
      }

      // Update consultation payment status
      await Consultation.findByIdAndUpdate(
        consultation_id,
        { 
          status: "paid",
          transaction_id: transaction._id
        },
        { new: true }
      );
    }

    return successResponse(
      res,
      "Payment successful",
      { transaction },
      200
    );
  } catch (error: any) {
    console.log("Payment Verify Error", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};


// Add this new controller function
export const HandleVpayWebhook = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Webhook received from VPay:", req.body);
    
    // Verify the webhook data (you might want to validate a signature)
    const { transactionRef, status, amount } = req.body;
    
    if (!transactionRef) {
      return errorResponse(res, "Invalid webhook data", {}, 400);
    }
    
    // Find related transaction or consultation and update its status
    // This depends on your application logic
    
    // Always respond with 200 to webhooks even if you encounter non-critical errors
    // This prevents the payment provider from retrying unnecessarily
    return successResponse(
      res,
      "Webhook received successfully",
      {},
      200
    );
  } catch (error: any) {
    console.error("Webhook handling error:", error);
    // Still return 200 to prevent retries
    return successResponse(
      res,
      "Webhook processed",
      {},
      200
    );
  }
};

// Add this new controller function
export const RecordPayment = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { 
      transactionRef, 
      reason, 
      consultation_id, 
      paymentStatus, 
      paymentMethod, 
      amount,
      metadata 
    } = req.body;
    
    const { user_id } = req.user!;
    if (!user_id) {
      return errorResponse(res, "User ID is required", {}, 400);
    }

    // Save transaction details directly
    const transaction = new Transaction({
      user_id,
      transactionRef,
      paymentmethod: paymentMethod || 'card',
      status: paymentStatus || 'paid',
      amount: amount,
      metadata: metadata || '',
      reversed: false,
    });
    
    await transaction.save();

    // If this is a consultation payment, update the consultation status
    if (reason === "consultation" && consultation_id) {
      // Update consultation payment status
      await Consultation.findByIdAndUpdate(
        consultation_id,
        {
          status: "paid",
          transaction_id: transaction._id
        },
        { new: true }
      );
    }

    return successResponse(
      res,
      "Payment recorded successfully",
      { transaction },
      200
    );
  } catch (error: any) {
    console.log("Payment recording error:", error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
