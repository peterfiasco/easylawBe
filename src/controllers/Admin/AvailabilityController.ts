import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import ConsultationTimeSlot from "../../models/ConsultationTimeSlot";
import BlockedDate from "../../models/BlockedDate";
import { CustomRequest } from "../../middleware/authMiddleware";

export class AvailabilityController {
  // Time Slots Management
  static async getAllTimeSlots(req: Request, res: Response): Promise<void> {
    try {
      const timeSlots = await ConsultationTimeSlot.find().sort({ start_time: 1 });
      
      return successResponse(
        res,
        "Time slots retrieved successfully",
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

  static async createTimeSlot(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { start_time, end_time } = req.body;
      
      if (!start_time) {
        return errorResponse(
          res,
          "Start time is required",
          {},
          400
        );
      }
      
      // Check if time slot already exists
      const existingSlot = await ConsultationTimeSlot.findOne({ start_time });
      if (existingSlot) {
        return errorResponse(
          res,
          "Time slot already exists",
          {},
          400
        );
      }
      
      const newTimeSlot = new ConsultationTimeSlot({
        start_time,
        end_time,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await newTimeSlot.save();
      
      return successResponse(
        res,
        "Time slot created successfully",
        newTimeSlot,
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
  }

  static async updateTimeSlot(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { start_time, end_time, is_active } = req.body;
      
      const timeSlot = await ConsultationTimeSlot.findById(id);
      if (!timeSlot) {
        return errorResponse(
          res,
          "Time slot not found",
          {},
          404
        );
      }
      
      timeSlot.start_time = start_time || timeSlot.start_time;
      timeSlot.end_time = end_time || timeSlot.end_time;
      timeSlot.is_active = is_active !== undefined ? is_active : timeSlot.is_active;
      timeSlot.updated_at = new Date();
      
      await timeSlot.save();
      
      return successResponse(
        res,
        "Time slot updated successfully",
        timeSlot,
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

  static async deleteTimeSlot(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deletedTimeSlot = await ConsultationTimeSlot.findByIdAndDelete(id);
      if (!deletedTimeSlot) {
        return errorResponse(
          res,
          "Time slot not found",
          {},
          404
        );
      }
      
      return successResponse(
        res,
        "Time slot deleted successfully",
        {},
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

  // Blocked Dates Management
  static async getBlockedDates(req: Request, res: Response): Promise<void> {
    try {
      const blockedDates = await BlockedDate.find().sort({ date: 1 });
      
      return successResponse(
        res,
        "Blocked dates retrieved successfully",
        blockedDates,
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

  static async blockDate(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { date, reason } = req.body;
      
      if (!date) {
        return errorResponse(
          res,
          "Date is required",
          {},
          400
        );
      }
      
      // Check if date is already blocked
      const existingBlock = await BlockedDate.findOne({ 
        date: new Date(date) 
      });
      
      if (existingBlock) {
        return errorResponse(
          res,
          "This date is already blocked",
          {},
          400
        );
      }
      
      const newBlockedDate = new BlockedDate({
        date: new Date(date),
        reason,
        created_by: req.user?._id,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await newBlockedDate.save();
      
      return successResponse(
        res,
        "Date blocked successfully",
        newBlockedDate,
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
  }

  static async unblockDate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deletedBlock = await BlockedDate.findByIdAndDelete(id);
      if (!deletedBlock) {
        return errorResponse(
          res,
          "Blocked date not found",
          {},
          404
        );
      }
      
      return successResponse(
        res,
        "Date unblocked successfully",
        {},
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