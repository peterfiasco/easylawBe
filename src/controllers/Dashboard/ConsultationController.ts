import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { BookConsultationInterface } from "../../types/Dashboard";
import { BookConsultationSchema } from "./Validation/Validator";
import Consultation from "../../models/Consultation";

export const BookConsultation = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { call_type, date, time }: BookConsultationInterface = req.body;

    const { error } = BookConsultationSchema.validate(req.body);
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

    const newbooking = new Consultation({
      user_id,
      call_type,
      date,
      time,
    });

    await newbooking.save();

    var amount;
    if (call_type == "video") {
      amount = 200;
    } else {
      amount = 100;
    }
    return successResponse(
      res,
      "Consultation reservation made, please proceed to payment to confirm reservation",
      { amount, newbooking },
      201
    );
  } catch (error: any) {
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
};
