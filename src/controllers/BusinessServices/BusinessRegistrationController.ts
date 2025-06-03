import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import ServiceRequest from "../../models/ServiceRequest";
import BusinessRegistration from "../../models/BusinessRegistration";
import { generateAlphanumeric } from "../../utils/helpers";
import { sendGenericNotificationEmail } from "../../services/email.service";
import User from "../../models/User";

export class BusinessRegistrationController {
  // Submit business registration request
  static async submitRegistrationRequest(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const {
        business_name,
        business_type,
        registration_type,
        proposed_names,
        business_address,
        directors,
        shareholders,
        business_objectives,
        authorized_share_capital,
        issued_share_capital,
        priority = 'standard'
      } = req.body;

      // Validate required fields
      if (!business_name || !business_type || !registration_type || !business_address) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "Business name, type, registration type, and address are required" },
          400
        );
      }

      // Calculate pricing based on registration type and priority
      const basePrices: { [key: string]: number } = {
        incorporation: 25000,
        annual_filing: 15000,
        change_of_directors: 10000,
        change_of_address: 8000
      };

      const priorityMultipliers: { [key: string]: number } = {
        standard: 1,
        express: 1.5,
        urgent: 2
      };

      const baseAmount = basePrices[registration_type] || 25000;
      const totalAmount = baseAmount * priorityMultipliers[priority];

      // Calculate estimated completion date
      const completionDays: { [key: string]: { [key: string]: number } } = {
        standard: { incorporation: 21, annual_filing: 14, change_of_directors: 10, change_of_address: 7 },
        express: { incorporation: 14, annual_filing: 10, change_of_directors: 7, change_of_address: 5 },
        urgent: { incorporation: 7, annual_filing: 5, change_of_directors: 3, change_of_address: 2 }
      };

      const daysToComplete = completionDays[priority]?.[registration_type] || 21;
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + daysToComplete);

      // Generate reference number
      const referenceNumber = `BR${Date.now()}${generateAlphanumeric(6)}`;

      // Create service request
      const serviceRequest = new ServiceRequest({
        user_id,
        service_type: 'business_registration',
        service_subtype: registration_type,
        reference_number: referenceNumber,
        status: 'submitted',
        priority,
        estimated_completion: estimatedCompletion,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_status: 'pending'
      });

      await serviceRequest.save();

      // Create business registration details
      const businessRegistration = new BusinessRegistration({
        service_request_id: serviceRequest._id,
        business_name,
        business_type,
        registration_type,
        proposed_names: proposed_names || [business_name],
        business_address,
        directors: directors || [],
        shareholders: shareholders || [],
        business_objectives: business_objectives || [],
        authorized_share_capital: authorized_share_capital || 100000,
        issued_share_capital: issued_share_capital || 100000,
        memorandum_articles: '',
        cac_status: 'not_submitted'
      });

      await businessRegistration.save();

      // Get user details for email
      console.log('🔍 [EMAIL DEBUG] Starting email process for user_id:', user_id);
      
      const user = await User.findById(user_id);
      console.log('👤 [EMAIL DEBUG] User found:', user ? {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        hasEmail: !!user.email
      } : 'USER NOT FOUND');

      if (user) {
        if (!user.email) {
          console.error('❌ [EMAIL DEBUG] User has no email address');
        } else {
          try {
            console.log('📧 [EMAIL DEBUG] Attempting to send email to:', user.email);
            console.log('📧 [EMAIL DEBUG] Email function exists:', typeof sendGenericNotificationEmail);
            
            const emailData = {
              subject: `Business Registration Request Submitted - ${referenceNumber}`,
              title: 'Business Registration Request Confirmed!',
              message: `
                <p>Your business registration request has been successfully submitted and is now being processed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #103077; margin-top: 0;">Registration Details:</h3>
                  <p><strong>Reference Number:</strong> ${referenceNumber}</p>
                  <p><strong>Business Name:</strong> ${business_name}</p>
                  <p><strong>Registration Type:</strong> ${registration_type.replace('_', ' ').toUpperCase()}</p>
                  <p><strong>Priority:</strong> ${priority.toUpperCase()}</p>
                  <p><strong>Estimated Completion:</strong> ${estimatedCompletion.toLocaleDateString()}</p>
                  <p><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</p>
                </div>
                
                <p>Our team will begin processing your registration request shortly. You will receive regular updates on the progress.</p>
                
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
              `,
              actionUrl: `${process.env.FRONTEND_URL}/dashboard/business-services`,
              actionText: 'View My Services'
            };

            console.log('📧 [EMAIL DEBUG] Email data prepared:', {
              to: user.email,
              name: user.first_name,
              subject: emailData.subject,
              hasMessage: !!emailData.message,
              actionUrl: emailData.actionUrl
            });

            // Send confirmation email using existing email service
            const emailResult = await sendGenericNotificationEmail(user.email, user.first_name, emailData);
            
            console.log('✅ [EMAIL DEBUG] Email sent successfully, result:', emailResult);
            console.log('✅ Business registration confirmation email sent successfully');
            
          } catch (emailError) {
            console.error('❌ [EMAIL DEBUG] Email sending failed:');
            console.error('❌ [EMAIL DEBUG] Error type:', typeof emailError);
            console.error('❌ [EMAIL DEBUG] Error message:', emailError?.message);
            console.error('❌ [EMAIL DEBUG] Error stack:', emailError?.stack);
            console.error('❌ [EMAIL DEBUG] Full error object:', emailError);
            
            // Don't fail the entire request if email fails
          }
        }
      } else {
        console.error('❌ [EMAIL DEBUG] No user found with ID:', user_id);
      }

      return successResponse(
        res,
        "Business registration request submitted successfully",
        {
          service_request: serviceRequest,
          business_registration: businessRegistration,
          reference_number: referenceNumber,
          total_amount: totalAmount,
          estimated_completion: estimatedCompletion
        },
        201
      );
    } catch (error: any) {
      console.error('Error submitting business registration:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get business registration details
  static async getRegistrationDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'business_registration'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Registration request not found", {}, 404);
      }

      const businessRegistration = await BusinessRegistration.findOne({
        service_request_id: serviceRequest._id
      });

      return successResponse(
        res,
        "Registration details retrieved successfully",
        {
          service_request: serviceRequest,
          business_registration: businessRegistration
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

  // Get all user's business registrations
  static async getUserRegistrations(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      console.log('📊 Fetching user business registrations for user:', user_id);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const serviceRequests = await ServiceRequest.find({
        user_id,
        service_type: 'business_registration'
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

      const total = await ServiceRequest.countDocuments({
        user_id,
        service_type: 'business_registration'
      });

      // Get business registration details for each service request
      const registrationsWithDetails = await Promise.all(
        serviceRequests.map(async (request) => {
          const businessReg = await BusinessRegistration.findOne({
            service_request_id: request._id
          });
          return {
            service_request: request,
            business_registration: businessReg,
            documents: []
          };
        })
      );

      console.log('✅ Found', registrationsWithDetails.length, 'business registrations');

      return successResponse(
        res,
        "User registrations retrieved successfully",
        {
          registrations: registrationsWithDetails,
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
      console.error('❌ Error fetching user registrations:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Update business registration
  static async updateRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;
      const updateData = req.body;

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'business_registration'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Registration request not found", {}, 404);
      }

      // Only allow updates if status is 'submitted' or 'requires_action'
      if (!['submitted', 'requires_action'].includes(serviceRequest.status)) {
        return errorResponse(
          res,
          "Registration cannot be updated in current status",
          {},
          400
        );
      }

      const updatedBusinessReg = await BusinessRegistration.findOneAndUpdate(
        { service_request_id: serviceRequest._id },
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      );

      return successResponse(
        res,
        "Registration updated successfully",
        { business_registration: updatedBusinessReg },
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

  // Get registration status
  static async getRegistrationStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;

      console.log('🔍 Fetching registration status for:', reference_number);

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'business_registration'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Registration request not found", {}, 404);
      }

      const businessRegistration = await BusinessRegistration.findOne({
        service_request_id: serviceRequest._id
      });

      console.log('✅ Registration status retrieved successfully');

      return successResponse(
        res,
        "Registration status retrieved successfully",
        {
          status: serviceRequest.status,
          payment_status: serviceRequest.payment_status,
          estimated_completion: serviceRequest.estimated_completion,
          actual_completion: serviceRequest.actual_completion,
          service_request: serviceRequest,
          business_registration: businessRegistration
        },
        200
      );
    } catch (error: any) {
      console.error('❌ Error fetching registration status:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Cancel registration
  static async cancelRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;
      const { reason } = req.body;

      console.log('🚫 Cancelling registration:', reference_number);

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'business_registration'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Registration request not found", {}, 404);
      }

      // Only allow cancellation if status is 'submitted' or 'requires_action'
      if (!['submitted', 'requires_action'].includes(serviceRequest.status)) {
        return errorResponse(
          res,
          "Cannot cancel registration in current status",
          { 
            error: `Registration with status '${serviceRequest.status}' cannot be cancelled`,
            current_status: serviceRequest.status 
          },
          400
        );
      }

      // Update status to cancelled
      serviceRequest.status = 'cancelled';
      serviceRequest.updated_at = new Date();
      
      // Add cancellation note
      serviceRequest.notes.push({
        message: reason || 'Registration cancelled by user',
        added_by: user_id,
        date: new Date(),
        type: 'user'
      });

      await serviceRequest.save();

      console.log('✅ Registration cancelled successfully');

      return successResponse(
        res,
        "Registration cancelled successfully",
        {
          service_request: serviceRequest,
          cancelled_at: new Date(),
          reason: reason || 'Registration cancelled by user'
        },
        200
      );
    } catch (error: any) {
      console.error('❌ Error cancelling registration:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}
