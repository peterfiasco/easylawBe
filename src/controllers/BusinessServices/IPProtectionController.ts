import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import ServiceRequest from "../../models/ServiceRequest";
import IPProtection from "../../models/IPProtection";
import { generateAlphanumeric } from "../../utils/helpers";
import { sendIPProtectionConfirmation } from "../../services/business-email.service";
import User from "../../models/User";

export class IPProtectionController {
  // Submit IP protection request
  static async submitIPProtectionRequest(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const {
        protection_type,
        application_details,
        applicant_info,
        trademark_details,
        patent_details,
        copyright_details,
        dispute_details,
        priority = 'standard'
      } = req.body;

      // Validate required fields
      if (!protection_type || !application_details || !applicant_info) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "Protection type, application details, and applicant info are required" },
          400
        );
      }

      // Calculate pricing based on protection type and priority
      const basePrices = {
        trademark: 50000,
        copyright: 30000,
        patent: 150000,
        industrial_design: 40000,
        dispute_resolution: 80000
      };

      const priorityMultipliers = {
        standard: 1,
        express: 1.5,
        urgent: 2
      };

      const baseAmount = basePrices[protection_type] || 50000;
      const totalAmount = baseAmount * priorityMultipliers[priority];

      // Calculate estimated completion date
      const completionDays = {
        standard: { trademark: 90, copyright: 30, patent: 180, industrial_design: 60, dispute_resolution: 120 },
        express: { trademark: 60, copyright: 21, patent: 120, industrial_design: 45, dispute_resolution: 90 },
        urgent: { trademark: 30, copyright: 14, patent: 90, industrial_design: 30, dispute_resolution: 60 }
      };

      const daysToComplete = completionDays[priority][protection_type] || 90;
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + daysToComplete);

      // Generate reference number
      const referenceNumber = `IP${Date.now()}${generateAlphanumeric(6)}`;

      // Create service request
      const serviceRequest = new ServiceRequest({
        user_id,
        service_type: 'ip_protection',
        service_subtype: protection_type,
        reference_number: referenceNumber,
        status: 'submitted',
        priority,
        estimated_completion: estimatedCompletion,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_status: 'pending'
      });

      await serviceRequest.save();

      // Create IP protection details
      const ipProtection = new IPProtection({
        service_request_id: serviceRequest._id,
        protection_type,
        application_details,
        applicant_info,
        trademark_details: protection_type === 'trademark' ? trademark_details : undefined,
        patent_details: protection_type === 'patent' ? patent_details : undefined,
        copyright_details: protection_type === 'copyright' ? copyright_details : undefined,
        dispute_details: protection_type === 'dispute_resolution' ? dispute_details : undefined,
        filing_status: 'not_filed'
      });

      await ipProtection.save();

      // Get user details for email
      const user = await User.findById(user_id);
      if (user) {
        await sendIPProtectionConfirmation(user.email, user.first_name, {
          referenceNumber,
          protectionType: protection_type.replace('_', ' ').toUpperCase(),
          applicationTitle: application_details.title,
          estimatedCompletion: estimatedCompletion.toLocaleDateString(),
          amount: totalAmount
        });
      }

      return successResponse(
        res,
        "IP protection request submitted successfully",
        {
          service_request: serviceRequest,
          ip_protection: ipProtection,
          reference_number: referenceNumber,
          total_amount: totalAmount,
          estimated_completion: estimatedCompletion
        },
        201
      );
    } catch (error: any) {
      console.error('Error submitting IP protection request:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get IP protection details
  static async getIPProtectionDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'ip_protection'
      });

      if (!serviceRequest) {
        return errorResponse(res, "IP protection request not found", {}, 404);
      }

      const ipProtection = await IPProtection.findOne({
        service_request_id: serviceRequest._id
      });

      return successResponse(
        res,
        "IP protection details retrieved successfully",
        {
          service_request: serviceRequest,
          ip_protection: ipProtection
        },
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

  // Get user's IP protection requests
  static async getUserIPProtectionRequests(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const serviceRequests = await ServiceRequest.find({
        user_id,
        service_type: 'ip_protection'
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

      const total = await ServiceRequest.countDocuments({
        user_id,
        service_type: 'ip_protection'
      });

      const requestsWithDetails = await Promise.all(
        serviceRequests.map(async (request) => {
          const ipProtection = await IPProtection.findOne({
            service_request_id: request._id
          });
          return {
            service_request: request,
            ip_protection: ipProtection
          };
        })
      );

      return successResponse(
        res,
        "IP protection requests retrieved successfully",
        {
          requests: requestsWithDetails,
          pagination: {
            current_page: page,
            total_pages: Math.ceil(total / limit),
            total_records: total,
            has_next: page * limit < total,
            has_prev: page > 1
          }
        },
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