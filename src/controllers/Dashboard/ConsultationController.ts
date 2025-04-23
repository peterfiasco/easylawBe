import { Request, Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import { BookConsultationInterface } from "../../types/Dashboard";
import { BookConsultationSchema } from "./Validation/Validator";
import Consultation from "../../models/Consultation";
import ConsultationType from "../../models/ConsultationType";

export const BookConsultation = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { consultation_type_id, date, time, reason }: BookConsultationInterface = req.body;
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
      return errorResponse(res, "User ID is required", {}, 400);
    }

    // Get consultation type price from database
    const consultationType = await ConsultationType.findById(consultation_type_id);
    if (!consultationType) {
      return errorResponse(res, "Invalid consultation type", {}, 400);
    }

    const newbooking = new Consultation({
      user_id,
      consultation_type_id,
      date,
      time,
      reason,
      status: "pending"
    });

    await newbooking.save();

    return successResponse(
      res,
      "Consultation reservation made, please proceed to payment to confirm reservation",
      { amount: consultationType.price, newbooking },
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

// Add method to fetch consultation types for users
export const GetConsultationTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const types = await ConsultationType.find().sort({ price: 1 });
    
    return successResponse(
      res,
      "Consultation types retrieved successfully",
      types,
      200
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



