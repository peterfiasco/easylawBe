import { Request, Response } from "express";
import { errorResponse, successResponse } from "../../utils/response";
import ConsultationType from "../../models/ConsultationType";
import Consultation from "../../models/Consultation";
import { CustomRequest } from "../../middleware/authMiddleware";
import { IConsultationPopulated } from "../../models/modelInterface";

export class AdminConsultationController {
  // Get all consultation types (plural - matches route)
  static async getConsultationTypes(req: Request, res: Response): Promise<void> {
    try {
      const types = await ConsultationType.find().sort({ created_at: -1 });
      
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
      
      if (!name || !description || !call_type || !price) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "All fields are required" },
          400
        );
      }
      
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
      const inUse = await Consultation.findOne({ consultation_type_id: id });
      if (inUse) {
        return errorResponse(
          res,
          "Cannot delete: this consultation type is in use by existing bookings",
          {},
          400
        );
      }
      
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

  // Get all consultation bookings with user details - 🔧 FIXED TYPE ERRORS
  static async getConsultationBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      const bookings = await Consultation.find()
        .populate('user_id', 'first_name last_name email phone_number')
        .populate('consultation_type_id')
        .sort({ createdAt: -1 }) as IConsultationPopulated[];
      
      const formattedBookings = bookings.map((booking) => {
        // Type guard to ensure user_id is populated
        if (!booking || !booking.user_id || typeof booking.user_id === 'string') {
          console.log('Missing or unpopulated user data:', booking);
          return null;
        }
        
        return {
          id: booking._id,
          user: {
            id: booking.user_id._id,
            name: `${booking.user_id.first_name} ${booking.user_id.last_name}`,
            email: booking.user_id.email,
            phone: booking.user_id.phone_number?.toString() || 'Not provided'
          },
          consultation_type: booking.consultation_type_id && typeof booking.consultation_type_id !== 'string' ? {
            id: booking.consultation_type_id._id,
            name: booking.consultation_type_id.name,
            call_type: booking.consultation_type_id.call_type,
            price: booking.consultation_type_id.price,
            duration: booking.consultation_type_id.duration
          } : {
            id: 'unknown',
            name: 'Unknown Type',
            call_type: 'phone',
            price: 0,
            duration: 30
          },
          date: booking.date,
          time: booking.time,
          reason: booking.reason || 'No reason provided',
          status: booking.status || 'pending',
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

  // 🔧 FIXED TYPE ERRORS - Send consultation confirmation
  static async sendConsultationConfirmation(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { consultationId } = req.params;
      
      const consultation = await Consultation.findById(consultationId)
        .populate('user_id', 'first_name last_name email')
        .populate('consultation_type_id') as IConsultationPopulated | null;
      
      if (!consultation) {
        return errorResponse(res, "Consultation not found", {}, 404);
      }
      
      // Type guard to ensure proper population
      if (!consultation.user_id || typeof consultation.user_id === 'string' || 
          !consultation.consultation_type_id || typeof consultation.consultation_type_id === 'string') {
        return errorResponse(res, "Consultation data not properly populated", {}, 500);
      }
      
      // Send confirmation email (implement email service)
      const emailData = {
        to: consultation.user_id.email,
        subject: "Consultation Booking Confirmation - EasyLaw Solutions",
        template: "consultation_confirmation",
        data: {
          userName: `${consultation.user_id.first_name} ${consultation.user_id.last_name}`,
          consultationType: consultation.consultation_type_id.name,
          date: new Date(consultation.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          time: consultation.time,
          duration: consultation.consultation_type_id.duration,
          price: consultation.consultation_type_id.price,
          callType: consultation.consultation_type_id.call_type,
          reason: consultation.reason
        }
      };
      
      // TODO: Implement actual email sending
      console.log('Email data prepared:', emailData);
      
      return successResponse(
        res,
        "Confirmation email prepared successfully",
        {},
        200
      );
    } catch (error: any) {
      console.error('Error sending consultation confirmation:', error);
      return errorResponse(
        res,
        "Failed to send confirmation email",
        { error: error.message },
        500
      );
    }
  }

  // Add this method to the AdminConsultationController class
  static async deleteConsultationBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return errorResponse(
          res,
          "Missing ID parameter",
          { error: "Consultation booking ID is required" },
          400
        );
      }
      
      const deletedBooking = await Consultation.findByIdAndDelete(id);
      
      if (!deletedBooking) {
        return errorResponse(res, "Consultation booking not found", {}, 404);
      }
      
      return successResponse(
        res,
        "Consultation booking deleted successfully",
        { deletedId: id },
        200
      );
    } catch (error: any) {
      console.error('Error deleting consultation booking:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Also add a method to cancel/update status
  static async updateConsultationStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!id) {
        return errorResponse(
          res,
          "Missing ID parameter",
          { error: "Consultation booking ID is required" },
          400
        );
      }
      
      if (!status || !['pending', 'paid', 'completed', 'cancelled'].includes(status)) {
        return errorResponse(
          res,
          "Invalid status",
          { error: "Status must be one of: pending, paid, completed, cancelled" },
          400
        );
      }
      
      const updatedBooking = await Consultation.findByIdAndUpdate(
        id,
        { status, updated_at: new Date() },
        { new: true, runValidators: true }
      );
      
      if (!updatedBooking) {
        return errorResponse(res, "Consultation booking not found", {}, 404);
      }
      
      return successResponse(
        res,
        "Consultation status updated successfully",
        {
          id: updatedBooking._id,
          status: updatedBooking.status
        },
        200
      );
    } catch (error: any) {
      console.error('Error updating consultation status:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}
