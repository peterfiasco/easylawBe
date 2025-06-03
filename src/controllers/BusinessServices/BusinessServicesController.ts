import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import BusinessService, { IBusinessServiceModel } from "../../models/BusinessService";
import Transaction from "../../models/Transaction";
import { sendBusinessServiceStatusUpdate } from "../../services/email.service";
import User from "../../models/User";
import BusinessServicePricing from "../../models/BusinessServicePricing"


export class BusinessServicesController {
  // Submit business registration request
  static async submitBusinessRegistration(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const {
        clientInfo,
        businessDetails,
        directors,
        shareholders,
        priority,
        additionalRequirements
      } = req.body;

      // Validate required fields
      if (!clientInfo || !businessDetails || !directors || !shareholders) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "All sections must be completed" },
          400
        );
      }

      // Calculate amount based on priority
      const baseAmount = 45000;
      const priorityMultiplier = {
        'standard': 1,
        'express': 1.5,
        'urgent': 2
      };
      const amount = baseAmount * (priorityMultiplier[priority] || 1);

      // Generate reference number
      const referenceNumber = (BusinessService as any).generateReferenceNumber('business_registration');

      // Calculate estimated completion
      const estimatedDays = {
        'standard': 7,
        'express': 5,
        'urgent': 3
      };
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + (estimatedDays[priority] || 7));

      // Create business service record
      const businessService = new BusinessService({
        user_id,
        service_type: 'business_registration',
        service_name: 'Business Registration',
        reference_number: referenceNumber,
        status: 'submitted',
        priority,
        
        // Client Information
        client_name: clientInfo.fullName,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        
        // Business Details
        business_name: businessDetails.businessName,
        business_type: businessDetails.businessType,
        business_address: businessDetails.businessAddress,
        business_objects: businessDetails.businessObjects,
        
        // Directors and Shareholders
        directors,
        shareholders,
        
        // Payment and Timeline
        amount_paid: amount,
        payment_status: 'pending',
        estimated_completion: estimatedCompletion,
        progress_percentage: 10,
        status_message: 'Business registration request submitted successfully. Payment pending.',
        
        // Additional Info
        additional_requirements: additionalRequirements
      });

      await businessService.save();

      // Send confirmation email
      try {
        await sendBusinessServiceStatusUpdate(
  clientInfo.email,
  clientInfo.fullName,
  {
    serviceName: 'Business Registration',
    referenceNumber: referenceNumber,
    status: 'submitted',
    statusMessage: 'Business registration request submitted successfully. Payment pending.',
    serviceType: 'business_registration'
  }
);

      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      return successResponse(
        res,
        "Business registration request submitted successfully",
        {
          reference_number: referenceNumber,
          amount: amount,
          service_id: businessService._id,
          estimated_completion: estimatedCompletion
        },
        201
      );
    } catch (error: any) {
      console.error('Business registration submission error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
  

  // Submit due diligence request
  static async submitDueDiligence(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const {
        clientInfo,
        investigationDetails,
        priority,
        additionalRequirements
      } = req.body;

      // Validate required fields
      if (!clientInfo || !investigationDetails) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "Client info and investigation details are required" },
          400
        );
      }

      // Calculate amount based on investigation type and priority
      const baseAmounts = {
        'individual': 25000,
        'company': 35000,
        'asset': 30000
      };
      const baseAmount = baseAmounts[investigationDetails.investigationType] || 25000;
      const priorityMultiplier = {
        'standard': 1,
        'express': 1.5,
        'urgent': 2
      };
      const amount = baseAmount * (priorityMultiplier[priority] || 1);

      // Generate reference number
      const referenceNumber = (BusinessService as any).generateReferenceNumber('due_diligence');

      // Calculate estimated completion
      const estimatedDays = {
        'standard': 5,
        'express': 3,
        'urgent': 2
      };
      const estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + (estimatedDays[priority] || 5));

      // Create due diligence service record
      const dueDiligenceService = new BusinessService({
        user_id,
        service_type: 'due_diligence',
        service_name: 'Due Diligence Investigation',
        reference_number: referenceNumber,
        status: 'submitted',
        priority,
        
        // Client Information
        client_name: clientInfo.fullName,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        
        // Investigation Details
        investigation_type: investigationDetails.investigationType,
        subject_name: investigationDetails.subjectName,
        subject_details: investigationDetails.subjectDetails,
        investigation_scope: investigationDetails.investigationScope,
        urgency_level: investigationDetails.urgencyLevel,
        
        // Payment and Timeline
        amount_paid: amount,
        payment_status: 'pending',
        estimated_completion: estimatedCompletion,
        progress_percentage: 10,
        status_message: 'Due diligence investigation request submitted. Payment pending.',
        
        // Additional Info
        additional_requirements: additionalRequirements
      });

      await dueDiligenceService.save();

      // Send confirmation email
      try {
        await sendBusinessServiceStatusUpdate(
  clientInfo.email,
  clientInfo.fullName,
  {
    serviceName: 'Due Diligence Investigation',
    referenceNumber: referenceNumber,
    status: 'submitted',
    statusMessage: 'Due diligence investigation request submitted. Payment pending.',
    serviceType: 'due_diligence'
  }
);

      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      return successResponse(
        res,
        "Due diligence investigation request submitted successfully",
        {
          reference_number: referenceNumber,
          amount: amount,
          service_id: dueDiligenceService._id,
          estimated_completion: estimatedCompletion
        },
        201
      );
    } catch (error: any) {
      console.error('Due diligence submission error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get user's business services
  static async getUserServices(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { user_id } = req.user!;
      const { status, service_type, limit = 20, page = 1 } = req.query;

      // Build query
      const query: any = { user_id };
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (service_type && service_type !== 'all') {
        query.service_type = service_type;
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);

      // Fetch services with pagination
      const services = await BusinessService.find(query)
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip)
        .populate('transaction_id', 'transactionRef paymentmethod status amount')
        .lean();

      // Get total count for pagination
      const totalServices = await BusinessService.countDocuments(query);
      const totalPages = Math.ceil(totalServices / Number(limit));

      // Format response
      const formattedServices = services.map(service => ({
        id: service._id,
        service_type: service.service_type,
        service_name: service.service_name,
        reference_number: service.reference_number,
        status: service.status,
        priority: service.priority,
        client_name: service.client_name,
        client_email: service.client_email,
        client_phone: service.client_phone,
        business_name: service.business_name,
        amount_paid: service.amount_paid,
        payment_status: service.payment_status,
        payment_date: service.payment_date,
        estimated_completion: service.estimated_completion,
        actual_completion: service.actual_completion,
        progress_percentage: service.progress_percentage,
        status_message: service.status_message,
        documents: service.documents || [],
        created_at: service.createdAt,
        last_updated: service.last_updated
      }));

      return successResponse(
        res,
        "User business services retrieved successfully",
        {
          services: formattedServices,
          pagination: {
            current_page: Number(page),
            total_pages: totalPages,
            total_services: totalServices,
            has_next: Number(page) < totalPages,
            has_previous: Number(page) > 1
          }
        },
        200
      );
    } catch (error: any) {
      console.error('Get user services error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get service status by reference number
  static async getServiceStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { user_id } = req.user!;

      if (!referenceNumber) {
        return errorResponse(
          res,
          "Reference number is required",
          {},
          400
        );
      }

      // Find service by reference number and user
      const service = await BusinessService.findOne({
        reference_number: referenceNumber,
        user_id
      })
      .populate('transaction_id', 'transactionRef paymentmethod status amount reversed')
      .populate('assigned_staff', 'first_name last_name email')
      .lean();

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          { error: "No service found with this reference number" },
          404
        );
      }

      // Format response with all details
      const serviceDetails = {
        id: service._id,
        service_type: service.service_type,
        service_name: service.service_name,
        reference_number: service.reference_number,
        status: service.status,
        priority: service.priority,
        
        // Client Information
        client_name: service.client_name,
        client_email: service.client_email,
        client_phone: service.client_phone,
        
        // Business Details (if applicable)
        business_name: service.business_name,
        business_type: service.business_type,
        business_address: service.business_address,
        business_objects: service.business_objects,
        directors: service.directors || [],
        shareholders: service.shareholders || [],
        
        // Investigation Details (if applicable)
        investigation_type: service.investigation_type,
        subject_name: service.subject_name,
        subject_details: service.subject_details,
        investigation_scope: service.investigation_scope || [],
        urgency_level: service.urgency_level,
        
        // Payment Information
        amount_paid: service.amount_paid,
        payment_status: service.payment_status,
        payment_date: service.payment_date,
        transaction_reference: service.transaction_reference,
        transaction_details: service.transaction_id,
        
        // Progress Information
        estimated_completion: service.estimated_completion,
        actual_completion: service.actual_completion,
        progress_percentage: service.progress_percentage,
        status_message: service.status_message,
        last_updated: service.last_updated,
        
        // Documents
        documents: service.documents || [],
        
        // Additional Information
        additional_requirements: service.additional_requirements,
        assigned_staff: service.assigned_staff,
        
        // Timestamps
        created_at: service.createdAt,
        updated_at: service.updatedAt
      };

      return successResponse(
        res,
        "Service details retrieved successfully",
        serviceDetails,
        200
      );
    } catch (error: any) {
      console.error('Get service status error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

static async submitBusinessService(req: CustomRequest, res: Response): Promise<void> {
  try {
    const { user_id } = req.user!;
    const {
      registration_type,
      business_name,
      priority = 'standard',
      new_business_name,
      reason_for_change,
      new_address,
      annual_returns_year,
      current_address,
      new_authorized_capital,
      capital_increase_reason,
      ...otherData
    } = req.body;

    // Get user details for client info
    const user = await User.findById(user_id);
    if (!user) {
      return errorResponse(res, "User not found", {}, 404);
    }

    // Handle different registration types
    const servicePricing = {
      incorporation: { standard: 50000, express: 85000, urgent: 150000 },
      annual_returns: { standard: 15000, express: 25000, urgent: 35000 },
      name_change: { standard: 30000, express: 50000, urgent: 75000 },
      address_change: { standard: 25000, express: 40000, urgent: 60000 },
      increase_capital: { standard: 40000, express: 65000, urgent: 95000 }
    };

    const amount = servicePricing[registration_type]?.[priority] || 50000;
    const referenceNumber = (BusinessService as any).generateReferenceNumber('business_service');

    // Map registration types to valid service types
    const serviceTypeMapping = {
      incorporation: 'business_registration',
      annual_returns: 'business_registration', 
      name_change: 'business_registration',
      address_change: 'business_registration',
      increase_capital: 'business_registration'
    };

    // Create business service record with required fields
    const businessService = new BusinessService({
      user_id,
      service_type: serviceTypeMapping[registration_type] || 'business_registration',
      service_name: `Business ${registration_type.replace('_', ' ').toUpperCase()}`,
      reference_number: referenceNumber,
      status: 'submitted',
      priority,
      
      // Required client fields
      client_name: user.first_name + ' ' + user.last_name,
      client_email: user.email,
      client_phone: user.phone || 'Not provided',
      
      // Business details
      business_name,
      amount_paid: amount,
      payment_status: 'pending',
      
      // Store specific registration data based on type
      additional_requirements: JSON.stringify({
        registration_type,
        new_business_name,
        reason_for_change,
        new_address,
        annual_returns_year,
        current_address,
        new_authorized_capital,
        capital_increase_reason,
        ...otherData
      })
    });

    await businessService.save();

    return successResponse(
      res,
      "Business service request submitted successfully",
      {
        reference_number: referenceNumber,
        amount: amount,
        service_id: businessService._id
      },
      201
    );
  } catch (error: any) {
    console.error('Business service submission error:', error);
    return errorResponse(res, "Internal Server Error", { error: error.message }, 500);
  }
}


// Add pricing method:
static async getPricing(req: CustomRequest, res: Response): Promise<void> {
  try {
    // Fetch all active pricing configurations
    const pricingRecords = await BusinessServicePricing.find({ is_active: true })
      .select('service_type priority price duration description')
      .lean();

    // Group pricing by service type and priority
    const groupedPricing: any = {};
    
    pricingRecords.forEach((record: any) => {
      if (!groupedPricing[record.service_type]) {
        groupedPricing[record.service_type] = {};
      }
      
      groupedPricing[record.service_type][record.priority] = {
        price: record.price,
        duration: record.duration,
        description: record.description
      };
    });

    return successResponse(
      res,
      "Pricing retrieved successfully",
      groupedPricing,
      200
    );
  } catch (error: any) {
    console.error('Get pricing error:', error);
    return errorResponse(
      res,
      "Internal Server Error",
      { error: error.message },
      500
    );
  }
}



  // Update payment status (called after successful payment)
  static async updatePaymentStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { service_id, transaction_id, payment_status, transaction_reference } = req.body;
      const { user_id } = req.user!;

      if (!service_id || !transaction_id) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "Service ID and transaction ID are required" },
          400
        );
      }

      // Find and update the service
      const service = await BusinessService.findOneAndUpdate(
        { _id: service_id, user_id },
        {
          payment_status: payment_status || 'paid',
          payment_date: new Date(),
          transaction_id,
          transaction_reference,
          status: payment_status === 'paid' ? 'pending' : 'submitted',
          progress_percentage: payment_status === 'paid' ? 20 : 10,
          status_message: payment_status === 'paid' 
            ? 'Payment confirmed. Your request is now being processed.'
            : 'Payment verification pending.',
          last_updated: new Date()
        },
        { new: true }
      );

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          {},
          404
        );
      }

      // Send status update email
      if (payment_status === 'paid') {
        try {
          await sendBusinessServiceStatusUpdate(
  service.client_email,
  service.client_name,
  {
    serviceName: service.service_name,
    referenceNumber: service.reference_number,
    status: 'paid',
    statusMessage: 'Payment confirmed. Your request is now being processed.',
    serviceType: service.service_type
  }
);

        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      }

      return successResponse(
        res,
        "Payment status updated successfully",
        {
          reference_number: service.reference_number,
          status: service.status,
          payment_status: service.payment_status
        },
        200
      );
    } catch (error: any) {
      console.error('Update payment status error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Cancel a service request (only if not yet processed)
  static async cancelService(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { user_id } = req.user!;
      const { reason } = req.body;

      const service = await BusinessService.findOne({
        reference_number: referenceNumber,
        user_id
      });

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          {},
          404
        );
      }

      // Check if service can be cancelled
      if (!['submitted', 'pending'].includes(service.status)) {
        return errorResponse(
          res,
          "Service cannot be cancelled",
          { error: "Service is already being processed" },
          400
        );
      }

      // Update service status
      service.status = 'rejected';
      service.status_message = `Service cancelled by user. Reason: ${reason || 'No reason provided'}`;
      service.last_updated = new Date();
      await service.save();

      // Send cancellation email
      try {
        await sendBusinessServiceStatusUpdate(
  service.client_email,
  service.client_name,
  {
    serviceName: service.service_name,
    referenceNumber: service.reference_number,
    status: 'cancelled',
    statusMessage: `Service cancelled by user. Reason: ${reason || 'No reason provided'}`,
    serviceType: service.service_type
  }
);

      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }

      return successResponse(
        res,
        "Service cancelled successfully",
        {},
        200
      );
    } catch (error: any) {
      console.error('Cancel service error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}

