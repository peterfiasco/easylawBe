import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import ConsultationType from "../../models/ConsultationType";
import Consultation from "../../models/Consultation";
import { CustomRequest } from "../../middleware/authMiddleware";
import { Document } from "mongoose";
import { IUser } from "../../models/modelInterface";

export class AdminConsultationController {
  // Get all consultation types
  static async getConsultationTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await ConsultationType.find().sort({ created_at: -1 });
      
      // Make sure we return valid ID for frontend
      const formattedTypes = types.map(type => ({
        id: type._id,
        name: type.name,
        description: type.description,
        call_type: type.call_type,
        price: type.price,
        duration: type.duration,
        created_at: type.created_at,
        updated_at: type.updated_at
      }));
      
      return successResponse(
        res,
        "Consultation types retrieved successfully",
        formattedTypes,
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

  // Create a new consultation type
  static async createConsultationType(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, call_type, price, duration } = req.body;
      
      // Validate input
      if (!name || !description || !call_type || !price) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "All fields are required" },
          400
        );
      }
      
      // Create new consultation type
      const newType = new ConsultationType({
        name,
        description,
        call_type,
        price: Number(price),
        duration: Number(duration) || 30,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await newType.save();
      
      // Format response with id field
      const formatted = {
        id: newType._id,
        name: newType.name,
        description: newType.description,
        call_type: newType.call_type,
        price: newType.price,
        duration: newType.duration,
        created_at: newType.created_at,
        updated_at: newType.updated_at
      };
      
      return successResponse(
        res,
        "Consultation type created successfully",
        formatted,
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

  // Update a consultation type
  static async updateConsultationType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return errorResponse(
          res,
          "Missing ID parameter",
          { error: "Consultation type ID is required" },
          400
        );
      }
      
      const { name, description, call_type, price, duration } = req.body;
      
      // Find and update the consultation type
      const updatedType = await ConsultationType.findByIdAndUpdate(
        id,
        {
          name,
          description,
          call_type,
          price: Number(price),
          duration: Number(duration) || 30,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      );
      
      if (!updatedType) {
        return errorResponse(res, "Consultation type not found", {}, 404);
      }
      
      // Format response with id field
      const formatted = {
        id: updatedType._id,
        name: updatedType.name,
        description: updatedType.description,
        call_type: updatedType.call_type,
        price: updatedType.price,
        duration: updatedType.duration,
        created_at: updatedType.created_at,
        updated_at: updatedType.updated_at
      };
      
      return successResponse(
        res,
        "Consultation type updated successfully",
        formatted,
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

  // Delete a consultation type
  static async deleteConsultationType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return errorResponse(
          res,
          "Missing ID parameter",
          { error: "Consultation type ID is required" },
          400
        );
      }
      
      // Check if type is in use
      const inUse = await Consultation.findOne({ call_type: id });
      if (inUse) {
        return errorResponse(
          res,
          "Cannot delete: this consultation type is in use by existing bookings",
          {},
          400
        );
      }
      
      // Delete the consultation type
      const deletedType = await ConsultationType.findByIdAndDelete(id);
      
      if (!deletedType) {
        return errorResponse(res, "Consultation type not found", {}, 404);
      }
      
      return successResponse(
        res,
        "Consultation type deleted successfully",
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

  // Get all consultation bookings with user details
  static async getConsultationBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      const bookings = await Consultation.find()
        .populate('user_id', 'first_name last_name email phone_number') 
        .sort({ createdAt: -1 });
      
      // Transform to match frontend expectations based on actual data structure
      const formattedBookings = bookings.map((booking: any) => {
        // Skip if user_id is missing
        if (!booking || !booking.user_id) {
          console.log('Missing user data:', booking);
          return null;
        }
        
        // Create formatted booking with available fields
        return {
          id: booking._id,
          user: {
            id: booking.user_id._id,
            name: `${booking.user_id.first_name} ${booking.user_id.last_name}`,
            email: booking.user_id.email,
            phone: booking.user_id.phone_number?.toString() || 'Not provided'
          },
          consultation_type: {
            id: booking._id, // Using booking ID since there's no separate type
            name: `${booking.call_type === 'video' ? 'Video' : 'Phone'} Consultation`,
            call_type: booking.call_type,
            price: 0, // Default value since it's not in your current structure
            duration: 30 // Default value
          },
          date: booking.date,
          time: booking.time,
          reason: booking.reason || 'No reason provided',
          status: booking.status || booking.payment_status || 'pending',
          created_at: booking.createdAt
        };
      }).filter(booking => booking !== null);
      
      return successResponse(
        res,
        "Consultation bookings retrieved successfully",
        formattedBookings,
        200
      );
    } catch (error: any) {
      console.error('Error in getConsultationBookings:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}
