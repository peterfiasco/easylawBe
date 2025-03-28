import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { VerifyPaymentInterface } from "../../types/Payment";
import { PaymentValidationSchema } from "./PaymentValidation";
import { VerifyPayment } from "./VpayService";
import Consultation from "../../models/Consultation";
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
    //verify if amount is paid is the amount to be paid, will do this part as it's not yet confirmed
    // check for the reason which will determine where to check for time

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
    let expectedAmount = 0;
    if (reason === "consultation") {
      const consult = await Consultation.findById(consultation_id);
      if (!consult) {
        return errorResponse(res, "Consultation not found", {}, 404);
      }

      // Determine expected amount based on call type
      expectedAmount =
        consult.call_type === "video"
          ? 200
          : consult.call_type === "audio"
          ? 100
          : 0;

      // Compare the expected amount with the paid amount
      if (verify.data.orderamount !== expectedAmount) {
        return errorResponse(
          res,
          "Incorrect payment amount",
          { transaction },
          400
        );
      }

      // Object to store user updates
    const userConsult: Partial<{
        payment_status: string;
        transaction_id: any;
      }> = {};
      if (transaction) userConsult.payment_status = transaction.status;
      if (transaction) userConsult.transaction_id = transaction._id;
      await Consultation.findOneAndUpdate(
        { user_id },
        { $set: userConsult },
        { new: true, upsert: true }
      );
    }

    return successResponse(
        res,
        "Payment successful",
        { transaction },
        200
      );

    //what ever the status of the payment is send to db and frontend back
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
