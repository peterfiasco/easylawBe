import { sendConsultationBookingConfirmation } from "../../services/email.service";
import User from "../../models/User"; // ✅ ADD USER MODEL IMPORT

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
    const { date, time, reason }: { date: string; time: string; reason: string } = req.body;
    
    if (!date || !time || !reason) {
      return errorResponse(
        res,
        "Validation error: date, time, and reason are required",
        { error: "Missing required fields" },
        400
      );
    }

    const userId = req.user?._id || req.user?.user_id;
    if (!userId) {
      return errorResponse(res, "User authentication required", {}, 401);
    }

    // ✅ FETCH USER FROM DATABASE FOR EMAIL
    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, "User not found", {}, 404);
    }

    const consultationType = await ConsultationType.findOne().sort({ created_at: 1 });
    if (!consultationType) {
      return errorResponse(res, "No consultation type available", {}, 400);
    }

    const newbooking = new Consultation({
      user_id: userId,
      consultation_type_id: consultationType._id,
      date: new Date(date),
      time,
      reason,
      status: "pending"
    });

    await newbooking.save();

    // ✅ SEND EMAIL WITH DATABASE USER DATA
    try {
      await sendConsultationBookingConfirmation(
        user.email, // ✅ From database
        `${user.first_name} ${user.last_name}`, // ✅ From database - will show "Jonathan DiCaprio"
        {
          consultationType: consultationType.name,
          date: new Date(date),
          time: time,
          referenceNumber: newbooking._id.toString(),
          amount: consultationType.price
        }
      );
      
      console.log('✅ Consultation confirmation email sent successfully');
    } catch (emailError: any) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails - just log it
    }

    return successResponse(
      res,
      "Consultation reservation made, please proceed to payment to confirm reservation",
      { 
        amount: consultationType.price, 
        newbooking: {
          id: newbooking._id,
          consultation_type: {
            name: consultationType.name,
            price: consultationType.price,
            duration: consultationType.duration
          },
          date: newbooking.date,
          time: newbooking.time,
          reason: newbooking.reason,
          status: newbooking.status
        }
      },
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

// Get the single consultation type (simplified endpoint)
export const GetConsultationTypes = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Since we only have one type, return it directly
    const type = await ConsultationType.findOne().sort({ created_at: 1 });
    
    if (!type) {
      return errorResponse(res, "No consultation type found", {}, 404);
    }

    // Return as array for compatibility with existing frontend
    const formattedType = {
      _id: type._id,
      id: type._id,
      name: type.name,
      description: type.description,
      call_type: type.call_type,
      price: type.price,
      duration: type.duration
    };
    
    return successResponse(
      res,
      "Consultation type retrieved successfully",
      [formattedType], // Return as array for compatibility
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

// 🆕 NEW: Send booking confirmation email after payment
export const SendBookingConfirmation = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { consultation_id } = req.body;
    const userId = req.user?._id || req.user?.user_id;

    if (!consultation_id) {
      return errorResponse(res, "Consultation ID is required", {}, 400);
    }

    const consultation = await Consultation.findById(consultation_id)
      .populate('user_id', 'first_name last_name email')
      .populate('consultation_type_id', 'name price duration');

    if (!consultation) {
      return errorResponse(res, "Consultation not found", {}, 404);
    }

    if (consultation.user_id._id.toString() !== userId.toString()) {
      return errorResponse(res, "Unauthorized access", {}, 403);
    }

    const user = consultation.user_id as any;
    const consultationType = consultation.consultation_type_id as any;

    // ✅ FIXED - Use correct parameters for your email service
    await sendConsultationBookingConfirmation(
      user.email,
      `${user.first_name} ${user.last_name}`,
      {
        consultationType: consultationType.name,
        date: consultation.date,
        time: consultation.time,
        referenceNumber: consultation._id.toString(),
        amount: consultationType.price
      }
    );

    return successResponse(
      res,
      "Booking confirmation email sent successfully",
      {},
      200
    );
  } catch (error: any) {
    console.error('Error sending booking confirmation:', error);
    return errorResponse(
      res,
      "Failed to send confirmation email",
      { error: error.message },
      500
    );
  }
};
