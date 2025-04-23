import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import ConsultationTimeSlot from "../../models/ConsultationTimeSlot";
import BlockedDate from "../../models/BlockedDate";
import Consultation from "../../models/Consultation";

export class PublicAvailabilityController {
  // Get all active time slots for bookings
  static async getAvailableTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      const timeSlots = await ConsultationTimeSlot.find({ is_active: true })
        .sort({ start_time: 1 });
      
      return successResponse(
        res,
        "Available time slots retrieved successfully",
        timeSlots,
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
  }

  // Check if a specific date is available
  static async checkDateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      
      if (!date) {
        return errorResponse(
          res,
          "Date parameter is required",
          {},
          400
        );
      }
      
      // Format the date to match MongoDB date format (start of day)
      const requestedDate = new Date(date);
      requestedDate.setHours(0, 0, 0, 0);
      
      // Check if date is blocked
      const isBlocked = await BlockedDate.findOne({
        date: {
          $gte: requestedDate,
          $lt: new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });
      
      if (isBlocked) {
        return successResponse(
          res,
          "Date availability checked",
          { 
            available: false,
            reason: isBlocked.reason || "This date is not available for booking"
          },
          200
        );
      }
      
      // If not blocked, it's available
      return successResponse(
        res,
        "Date availability checked",
        { available: true },
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
  }

  // Get unavailable time slots for a specific date (already booked)
  static async getUnavailableTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      const { date } = req.params;
      
      if (!date) {
        return errorResponse(
          res,
          "Date parameter is required",
          {},
          400
        );
      }
      
      // Format the date to match MongoDB date format
      const requestedDate = new Date(date);
      requestedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(requestedDate.getTime() + 24 * 60 * 60 * 1000);
      
      // Find bookings for this date
      const bookings = await Consultation.find({
        date: {
          $gte: requestedDate,
          $lt: nextDay
        },
        status: { $ne: 'cancelled' }  // Ignore cancelled bookings
      });
      
      // Extract booked time slots
      const bookedTimeSlots = bookings.map(booking => booking.time);
      
      return successResponse(
        res,
        "Unavailable time slots retrieved",
        bookedTimeSlots,
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
  }
}