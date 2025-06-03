import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import ServiceRequest from "../../models/ServiceRequest";
import DueDiligencePricing from "../../models/DueDiligencePricing";
import { generateAlphanumeric } from "../../utils/helpers";
import { sendDueDiligenceConfirmation } from "../../services/email.service";
import User from "../../models/User";

export class DueDiligenceController {
  // Get public pricing for due diligence services
  static async getPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Fetching due diligence pricing...');
      
      const pricing = await DueDiligencePricing.find({ is_active: true })
        .select('investigation_type priority price duration description features')
        .sort({ investigation_type: 1, priority: 1 });

      if (!pricing || pricing.length === 0) {
        console.log('⚠️ No pricing found, returning fallback pricing');
        
        // Fallback pricing if none exists in database
        const fallbackPricing = {
          individual: {
            standard: { price: 15000, duration: '3-5 business days', features: ['Identity verification', 'Employment history', 'Criminal background check'] },
            express: { price: 18750, duration: '2-3 business days', features: ['Priority processing', 'Identity verification', 'Employment history', 'Criminal background check'] },
            urgent: { price: 22500, duration: '1-2 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
          },
          company: {
            standard: { price: 35000, duration: '5-7 business days', features: ['Corporate verification', 'Financial standing', 'Legal compliance check'] },
            express: { price: 43750, duration: '3-5 business days', features: ['Priority processing', 'All standard features'] },
            urgent: { price: 52500, duration: '2-3 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
          },
          asset: {
            standard: { price: 25000, duration: '3-5 business days', features: ['Property verification', 'Ownership check', 'Encumbrance status'] },
            express: { price: 31250, duration: '2-3 business days', features: ['Priority processing', 'All standard features'] },
            urgent: { price: 37500, duration: '1-2 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
          },
          comprehensive: {
            standard: { price: 60000, duration: '7-10 business days', features: ['Complete investigation', 'All verification types', 'Detailed report'] },
            express: { price: 75000, duration: '5-7 business days', features: ['Priority processing', 'All standard features'] },
            urgent: { price: 90000, duration: '3-5 business days', features: ['Urgent processing', 'All standard features', '24/7 support'] }
          }
        };
        
        return successResponse(
          res,
          "Due diligence pricing retrieved successfully (fallback)",
          fallbackPricing,
          200
        );
      }

      // Convert array to grouped object
      const groupedPricing = {};
      pricing.forEach(item => {
        if (!groupedPricing[item.investigation_type]) {
          groupedPricing[item.investigation_type] = {};
        }
        groupedPricing[item.investigation_type][item.priority] = {
          price: item.price,
          duration: item.duration,
          description: item.description,
          features: item.features || []
        };
      });

      console.log('✅ Due diligence pricing fetched successfully');
      
      return successResponse(
        res,
        "Due diligence pricing retrieved successfully",
        groupedPricing,
        200
      );
    } catch (error: any) {
      console.error('❌ Error fetching due diligence pricing:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Submit due diligence request
  static async submitDueDiligenceRequest(req: CustomRequest, res: Response): Promise<void> {
    try {
      // ✅ FIX: Get user ID from the correct field (_id, not userId)
      const userId = req.user?._id || req.user?.user_id;
      
      console.log('🔍 Due Diligence Auth Debug:', {
        userExists: !!req.user,
        userId: userId,
        userRole: req.user?.role,
        userEmail: req.user?.email
      });
      
      if (!userId) {
        console.log('❌ User not authenticated - no user ID found');
        return errorResponse(res, "User not authenticated", {}, 401);
      }

      // ✅ ADD: Check if user is regular user (not admin)
      if (req.user?.role !== 'user') {
        console.log('❌ Access denied - only regular users can submit due diligence requests');
        return errorResponse(res, "Access denied. Only regular users can submit due diligence requests.", {}, 403);
      }

      const {
        investigation_type,
        subject_name,
        subject_type,
        priority = 'standard',
        contact_information,
        company_registration_number,
        subject_address,
        investigation_scope,
        specific_requirements,
        background_information,
        urgency_reason
      } = req.body;

      console.log('📝 Form data received:', {
        investigation_type,
        subject_name,
        subject_type,
        priority,
        hasContactInfo: !!contact_information
      });

      // Parse contact_information if it's a string
      let parsedContactInfo;
      try {
        parsedContactInfo = typeof contact_information === 'string' 
          ? JSON.parse(contact_information) 
          : contact_information;
      } catch (error) {
        console.log('❌ Invalid contact information format');
        return errorResponse(
          res,
          "Invalid contact information format",
          { error: "Contact information must be valid JSON" },
          400
        );
      }

      // Validation
      if (!investigation_type || !subject_name || !investigation_scope) {
        console.log('❌ Missing required fields');
        return errorResponse(
          res,
          "Missing required fields",
          { error: "Investigation type, subject name, and investigation scope are required" },
          400
        );
      }

      if (!parsedContactInfo?.phone || !parsedContactInfo?.email) {
        console.log('❌ Missing contact information');
        return errorResponse(
          res,
          "Missing contact information",
          { error: "Phone and email are required" },
          400
        );
      }

      // Validate company registration for company types
      if ((investigation_type === 'company' || subject_type === 'company') && !company_registration_number) {
        console.log('❌ Missing company registration number');
        return errorResponse(
          res,
          "Company registration number required",
          { error: "Company registration number is required for corporate investigations" },
          400
        );
      }

      // ✅ ADD: Process uploaded files (like DocumentTemplateAdmin)
      let processedDocuments: any[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        console.log(`📎 Processing ${req.files.length} uploaded files`);
        processedDocuments = req.files.map((file: Express.Multer.File) => ({
          name: file.originalname,
          document_type: file.mimetype,
          file_buffer: file.buffer,
          file_size: file.size,
          mime_type: file.mimetype,
          upload_date: new Date(),
          uploaded_by: userId
        }));
      }

      // Get pricing
      const pricing = await DueDiligencePricing.findOne({
        investigation_type,
        priority
      });

      if (!pricing) {
        console.log('❌ Pricing not found');
        return errorResponse(
          res,
          "Pricing not found",
          { error: "Pricing information not available for selected options" },
          400
        );
      }

      // Calculate total amount
      const processingFee = 5000;
      const totalAmount = pricing.price + processingFee;

      // Generate reference number
      const referenceNumber = `DD${Date.now()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Calculate estimated completion
      const estimatedDays = parseInt(pricing.duration.split('-')[0]) || 3;
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + estimatedDays);

      console.log('💰 Creating service request:', {
        referenceNumber,
        totalAmount,
        filesCount: processedDocuments.length
      });

      // Create service request
      const serviceRequest = new ServiceRequest({
        user_id: userId,
        service_type: 'due_diligence',
        service_subtype: investigation_type,
        reference_number: referenceNumber,
        status: 'submitted',
        priority,
        estimated_completion: estimatedCompletion,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_status: 'pending',
        documents: processedDocuments, // ✅ ADD: Processed files with buffers
        investigation_details: {
          investigation_type,
          subject_name,
          subject_type,
          company_registration_number,
          subject_address,
          investigation_scope,
          specific_requirements,
          contact_information: parsedContactInfo,
          urgency_reason,
          background_information
        }
      });

      await serviceRequest.save();

      // Add system note
      serviceRequest.notes.push({
        message: `Due diligence investigation request submitted for ${subject_name}`,
        added_by: userId,
        date: new Date(),
        type: 'system'
      });

      await serviceRequest.save();

      console.log('✅ Due diligence request created successfully:', referenceNumber);

      return successResponse(
        res,
        "Due diligence request submitted successfully",
        {
          service_request: {
            _id: serviceRequest._id,
            reference_number: serviceRequest.reference_number,
            status: serviceRequest.status,
            priority: serviceRequest.priority,
            estimated_completion: serviceRequest.estimated_completion,
            total_amount: serviceRequest.total_amount,
            investigation_type,
            subject_name,
            uploaded_files_count: processedDocuments.length // ✅ ADD: File count info
          }
        },
        201
      );

    } catch (error: any) {
      console.error('❌ Error submitting due diligence request:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Add this new method
  static async getUserInvestigations(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      console.log('📊 Fetching user due diligence investigations for user:', user_id);
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const serviceRequests = await ServiceRequest.find({
        user_id,
        service_type: 'due_diligence'
      })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

      const total = await ServiceRequest.countDocuments({
        user_id,
        service_type: 'due_diligence'
      });

      console.log('✅ Found', serviceRequests.length, 'due diligence investigations');

      return successResponse(
        res,
        "User investigations retrieved successfully",
        serviceRequests,
        200
      );
    } catch (error: any) {
      console.error('❌ Error fetching user investigations:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Add this new method
  static async getInvestigationStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;

      console.log('🔍 Fetching investigation status for:', reference_number);

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'due_diligence'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      console.log('✅ Investigation status retrieved successfully');

      return successResponse(
        res,
        "Investigation status retrieved successfully",
        serviceRequest,
        200
      );
    } catch (error: any) {
      console.error('❌ Error fetching investigation status:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Add this new method
  static async getInvestigationDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { reference_number } = req.params;

      console.log('🔍 Fetching investigation details for:', reference_number);

      const serviceRequest = await ServiceRequest.findOne({
        reference_number,
        user_id,
        service_type: 'due_diligence'
      });

      if (!serviceRequest) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      console.log('✅ Investigation details retrieved successfully');

      return successResponse(
        res,
        "Investigation details retrieved successfully",
        {
          service_request: serviceRequest,
          investigation_details: serviceRequest.investigation_details
        },
        200
      );
    } catch (error: any) {
      console.error('❌ Error fetching investigation details:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}
