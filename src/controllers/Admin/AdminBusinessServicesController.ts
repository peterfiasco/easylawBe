import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import BusinessService from "../../models/BusinessService";
import { sendBusinessServiceStatusUpdate } from "../../services/email.service";
import BusinessServicePricing from "../../models/BusinessServicePricing";

export class AdminBusinessServicesController {
  // Get all business services with filtering and pagination
  static async getAllServices(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { 
        status, 
        service_type, 
        priority,
        payment_status,
        search,
        limit = 20, 
        page = 1,
        sort_by = 'createdAt',
        sort_order = 'desc'
      } = req.query;

      // Build query
      const query: any = {};
      
      if (status && status !== 'all') query.status = status;
      if (service_type && service_type !== 'all') query.service_type = service_type;
      if (priority && priority !== 'all') query.priority = priority;
      if (payment_status && payment_status !== 'all') query.payment_status = payment_status;
      
      // Search functionality
      if (search) {
        query.$or = [
          { reference_number: { $regex: search, $options: 'i' } },
          { client_name: { $regex: search, $options: 'i' } },
          { client_email: { $regex: search, $options: 'i' } },
          { business_name: { $regex: search, $options: 'i' } }
        ];
      }

      // Calculate pagination
      const skip = (Number(page) - 1) * Number(limit);
      const sortOrder = sort_order === 'desc' ? -1 : 1;

      // Fetch services
      const services = await BusinessService.find(query)
        .sort({ [sort_by as string]: sortOrder })
        .limit(Number(limit))
        .skip(skip)
        .populate('user_id', 'first_name last_name email phone_number')
        .populate('transaction_id', 'transactionRef paymentmethod status amount')
        .populate('assigned_staff', 'first_name last_name email')
        .lean();

      // Get total count
      const totalServices = await BusinessService.countDocuments(query);
      const totalPages = Math.ceil(totalServices / Number(limit));

      // Format response
      const formattedServices = services.map(service => ({
        id: service._id,
        reference_number: service.reference_number,
        service_type: service.service_type,
        service_name: service.service_name,
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
        user_details: service.user_id,
        transaction_details: service.transaction_id,
        assigned_staff: service.assigned_staff,
        documents_count: service.documents?.length || 0,
        created_at: service.createdAt,
        last_updated: service.last_updated
      }));

      // Get summary statistics
      const stats = await BusinessService.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            total_amount: { $sum: "$amount_paid" },
            avg_amount: { $avg: "$amount_paid" },
            completed_services: { 
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
            },
            pending_services: { 
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } 
            },
            processing_services: { 
              $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } 
            }
          }
        }
      ]);

      return successResponse(
        res,
        "Business services retrieved successfully",
        {
          services: formattedServices,
          pagination: {
            current_page: Number(page),
            total_pages: totalPages,
            total_services: totalServices,
            has_next: Number(page) < totalPages,
            has_previous: Number(page) > 1
          },
          statistics: stats[0] || {
            total_amount: 0,
            avg_amount: 0,
            completed_services: 0,
            pending_services: 0,
            processing_services: 0
          }
        },
        200
      );
    } catch (error: any) {
      console.error('Get all services error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get detailed service information
  static async getServiceDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;

      // ✅ FIX: Use BusinessService model (consistent with getAllServices)
      const service = await BusinessService.findOne({ reference_number: referenceNumber })
        .populate('user_id', 'first_name last_name email phone_number created_at')
        .populate('transaction_id', 'transactionRef paymentmethod status amount reversed created_at')
        .populate('assigned_staff', 'first_name last_name email')
        .lean();

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          {},
          404
        );
      }

      return successResponse(
        res,
        "Service details retrieved successfully",
        service,
        200
      );
    } catch (error: any) {
      console.error('Get service details error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Update service status and progress
  static async updateServiceStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { status, notes } = req.body;

      console.log('🔄 Updating business service status:', referenceNumber, 'to:', status);

      if (!status) {
        return errorResponse(
          res,
          "Status is required",
          { error: "Status field is required" },
          400
        );
      }

      // ✅ FIX: Use the correct status values that match the BusinessService model enum
      const validStatuses = ['submitted', 'processing', 'under_review', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(
          res,
          "Invalid status",
          { error: "Status must be one of: " + validStatuses.join(', ') },
          400
        );
      }

      // ✅ FIX: Use BusinessService model (same as getAllServices method)
      const service = await BusinessService.findOneAndUpdate(
        { reference_number: referenceNumber },
        {
          status,
          last_updated: new Date(),
          ...(status === 'completed' && { actual_completion: new Date() })
        },
        { new: true, runValidators: true }
      ).populate('user_id', 'first_name last_name email');

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          { error: `No service found with reference number: ${referenceNumber}` },
          404
        );
      }

      // Add admin note if provided
      if (notes) {
        service.internal_notes = notes;
        await service.save();
      }

      console.log('✅ Business service status updated successfully');

      return successResponse(
        res,
        "Service status updated successfully",
        {
          reference_number: service.reference_number,
          status: service.status,
          updated_at: service.last_updated
        },
        200
      );
    } catch (error: any) {
      console.error('❌ Update business service status error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Add document to service
  static async addDocument(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { name, type, url, download_url, preview_url, size } = req.body;

      if (!name || !type || !url || !download_url) {
        return errorResponse(
          res,
          "Missing required document fields",
          { error: "Document name, type, url, and download_url are required" },
          400
        );
      }

      const service = await BusinessService.findOne({ reference_number: referenceNumber });

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          {},
          404
        );
      }

      // Add document to service
      const newDocument = {
        name,
        type,
        size: size || 'Unknown',
        url,
        download_url,
        preview_url: preview_url || '',
        created_at: new Date()
      };

      service.documents = service.documents || [];
      service.documents.push(newDocument);
      service.last_updated = new Date();

      await service.save();

      // Send document notification email
      try {
        await sendBusinessServiceStatusUpdate(
  service.client_email,
  service.client_name,
  {
    serviceName: service.service_name,
    referenceNumber: service.reference_number,
    status: 'document_added',
    statusMessage: `New document added: ${name}`,
    serviceType: service.service_type
  }
);

      } catch (emailError) {
        console.error('Failed to send document notification email:', emailError);
      }

      return successResponse(
        res,
        "Document added successfully",
        {
          reference_number: service.reference_number,
          document: newDocument,
          total_documents: service.documents.length
        },
        200
      );
    } catch (error: any) {
      console.error('Add document error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Delete a service (admin only)
  static async deleteService(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { reason } = req.body;

      // ✅ FIX: Use BusinessService model
      const service = await BusinessService.findOne({ reference_number: referenceNumber });

      if (!service) {
        return errorResponse(
          res,
          "Service not found",
          {},
          404
        );
      }

      // Check if service can be deleted
      if (service.status === 'completed') {
        return errorResponse(
          res,
          "Cannot delete completed service",
          { error: "Completed services cannot be deleted" },
          400
        );
      }

      // Delete the service
      await BusinessService.findOneAndDelete({ reference_number: referenceNumber });

      return successResponse(
        res,
        "Service deleted successfully",
        {},
        200
      );
    } catch (error: any) {
      console.error('Delete service error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get analytics and statistics
  static async getAnalytics(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { period = '30', service_type } = req.query;
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));

      // Build match query
      const matchQuery: any = {
        createdAt: { $gte: startDate, $lte: endDate }
      };
      
      if (service_type && service_type !== 'all') {
        matchQuery.service_type = service_type;
      }

      // Aggregate analytics data
      const analytics = await BusinessService.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total_services: { $sum: 1 },
            total_revenue: { $sum: "$amount_paid" },
            avg_service_value: { $avg: "$amount_paid" },
            completed_services: { 
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
            },
            pending_services: { 
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } 
            },
            processing_services: { 
              $sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] } 
            },
            failed_services: { 
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } 
            }
          }
        }
      ]);

      // Get service type breakdown
      const serviceTypeBreakdown = await BusinessService.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$service_type",
            count: { $sum: 1 },
            revenue: { $sum: "$amount_paid" },
            avg_value: { $avg: "$amount_paid" }
          }
        },
        { $sort: { count: -1 } }
      ]);

      // Get daily service counts for trend analysis
      const dailyTrends = await BusinessService.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            services_count: { $sum: 1 },
            revenue: { $sum: "$amount_paid" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Get priority distribution
      const priorityBreakdown = await BusinessService.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
            revenue: { $sum: "$amount_paid" }
          }
        }
      ]);

      // Calculate completion rate
      const completionRate = analytics[0] ? 
        (analytics[0].completed_services / analytics[0].total_services * 100).toFixed(2) : 0;

      return successResponse(
        res,
        "Analytics retrieved successfully",
        {
          summary: analytics[0] || {
            total_services: 0,
            total_revenue: 0,
            avg_service_value: 0,
            completed_services: 0,
            pending_services: 0,
            processing_services: 0,
            failed_services: 0
          },
          completion_rate: completionRate,
          service_type_breakdown: serviceTypeBreakdown,
          priority_breakdown: priorityBreakdown,
          daily_trends: dailyTrends,
          period_days: Number(period)
        },
        200
      );
    } catch (error: any) {
      console.error('Get analytics error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get revenue analytics
  static async getRevenueAnalytics(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { period = '30', start_date, end_date } = req.query;
      
      // Calculate date range
      let startDate: Date;
      let endDate: Date = new Date();
      
      if (start_date && end_date) {
        startDate = new Date(start_date as string);
        endDate = new Date(end_date as string);
      } else {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - Number(period));
      }

      // Revenue by service type
      const revenueByServiceType = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            payment_status: 'paid'
          }
        },
        {
          $group: {
            _id: "$service_type",
            total_revenue: { $sum: "$amount_paid" },
            service_count: { $sum: 1 },
            avg_service_value: { $avg: "$amount_paid" }
          }
        },
        { $sort: { total_revenue: -1 } }
      ]);

      // Daily revenue trend
      const dailyRevenue = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            payment_status: 'paid'
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            daily_revenue: { $sum: "$amount_paid" },
            service_count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Monthly revenue comparison
      const monthlyRevenue = await BusinessService.aggregate([
        {
          $match: {
            payment_status: 'paid'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            monthly_revenue: { $sum: "$amount_paid" },
            service_count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 12 }
      ]);

      // Revenue summary
      const revenueSummary = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total_revenue: { 
              $sum: { 
                $cond: [{ $eq: ["$payment_status", "paid"] }, "$amount_paid", 0] 
              } 
            },
            pending_revenue: { 
              $sum: { 
                $cond: [{ $eq: ["$payment_status", "pending"] }, "$amount_paid", 0] 
              } 
            },
            failed_revenue: { 
              $sum: { 
                $cond: [{ $eq: ["$payment_status", "failed"] }, "$amount_paid", 0] 
              } 
            },
            total_services: { $sum: 1 },
            paid_services: { 
              $sum: { $cond: [{ $eq: ["$payment_status", "paid"] }, 1, 0] } 
            }
          }
        }
      ]);

      return successResponse(
        res,
        "Revenue analytics retrieved successfully",
        {
          summary: revenueSummary[0] || {
            total_revenue: 0,
            pending_revenue: 0,
            failed_revenue: 0,
            total_services: 0,
            paid_services: 0
          },
          revenue_by_service_type: revenueByServiceType,
          daily_revenue: dailyRevenue,
          monthly_revenue: monthlyRevenue,
          period: {
            start_date: startDate,
            end_date: endDate,
            days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        },
        200
      );
    } catch (error: any) {
      console.error('Get revenue analytics error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get performance analytics
  static async getPerformanceAnalytics(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { period = '30' } = req.query;
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(period));
      const endDate = new Date();

      // Service completion analytics
      const completionAnalytics = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avg_processing_time: {
              $avg: {
                $cond: [
                  { $and: [{ $ne: ["$actual_completion", null] }, { $ne: ["$createdAt", null] }] },
                  { $divide: [{ $subtract: ["$actual_completion", "$createdAt"] }, 1000 * 60 * 60 * 24] }, // Days
                  null
                ]
              }
            }
          }
        }
      ]);

      // Processing time by service type
      const processingTimeByType = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            actual_completion: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$service_type",
            avg_processing_days: {
              $avg: {
                $divide: [{ $subtract: ["$actual_completion", "$createdAt"] }, 1000 * 60 * 60 * 24]
              }
            },
            min_processing_days: {
              $min: {
                $divide: [{ $subtract: ["$actual_completion", "$createdAt"] }, 1000 * 60 * 60 * 24]
              }
            },
            max_processing_days: {
              $max: {
                $divide: [{ $subtract: ["$actual_completion", "$createdAt"] }, 1000 * 60 * 60 * 24]
              }
            },
            completed_count: { $sum: 1 }
          }
        },
        { $sort: { avg_processing_days: 1 } }
      ]);

      // Staff performance (if assigned_staff exists)
      const staffPerformance = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            assigned_staff: { $ne: null }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'assigned_staff',
            foreignField: '_id',
            as: 'staff_info'
          }
        },
        {
          $unwind: '$staff_info'
        },
        {
          $group: {
            _id: "$assigned_staff",
            staff_name: { $first: { $concat: ["$staff_info.first_name", " ", "$staff_info.last_name"] } },
            staff_email: { $first: "$staff_info.email" },
            total_assigned: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            in_progress: { $sum: { $cond: [{ $in: ["$status", ["processing", "review", "under_review"]] }, 1, 0] } },
            avg_completion_time: {
              $avg: {
                $cond: [
                  { $and: [{ $ne: ["$actual_completion", null] }, { $eq: ["$status", "completed"] }] },
                  { $divide: [{ $subtract: ["$actual_completion", "$createdAt"] }, 1000 * 60 * 60 * 24] },
                  null
                ]
              }
            }
          }
        },
        {
          $addFields: {
            completion_rate: {
              $multiply: [{ $divide: ["$completed", "$total_assigned"] }, 100]
            }
          }
        },
        { $sort: { completion_rate: -1 } }
      ]);

      // Service quality metrics (if feedback exists)
      const qualityMetrics = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            client_feedback: { $ne: null }
          }
        },
        {
          $group: {
            _id: "$service_type",
            avg_rating: { $avg: "$client_feedback.rating" },
            total_feedback: { $sum: 1 },
            positive_feedback: { 
              $sum: { $cond: [{ $gte: ["$client_feedback.rating", 4] }, 1, 0] } 
            }
          }
        },
        {
          $addFields: {
            satisfaction_rate: {
              $multiply: [{ $divide: ["$positive_feedback", "$total_feedback"] }, 100]
            }
          }
        },
        { $sort: { avg_rating: -1 } }
      ]);

      // Weekly performance trend
      const weeklyTrend = await BusinessService.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              week: { $week: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            total_services: { $sum: 1 },
            completed_services: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
            avg_progress: { $avg: "$progress_percentage" }
          }
        },
        {
          $addFields: {
            completion_rate: {
              $multiply: [{ $divide: ["$completed_services", "$total_services"] }, 100]
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } }
      ]);

      return successResponse(
        res,
        "Performance analytics retrieved successfully",
        {
          completion_analytics: completionAnalytics,
          processing_time_by_type: processingTimeByType,
          staff_performance: staffPerformance,
          quality_metrics: qualityMetrics,
          weekly_trend: weeklyTrend,
          period: {
            start_date: startDate,
            end_date: endDate,
            days: Number(period)
          }
        },
        200
      );
    } catch (error: any) {
      console.error('Get performance analytics error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get staff list for assignment
  static async getAllStaff(req: CustomRequest, res: Response): Promise<void> {
    try {
      const User = require('../../models/User').default;
      
      const staff = await User.find({
        role: { $in: ['admin', 'staff'] },
        is_active: { $ne: false }
      }).select('first_name last_name email role phone_number');

      const formattedStaff = staff.map((member: any) => ({
        id: member._id,
        name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        role: member.role,
        phone: member.phone_number || 'Not provided'
      }));

      return successResponse(
        res,
        "Staff list retrieved successfully",
        formattedStaff,
        200
      );
    } catch (error: any) {
      console.error('Get staff error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Assign staff to service
  static async assignStaff(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { staff_id, notes } = req.body;

      if (!staff_id) {
        return errorResponse(res, "Staff ID is required", {}, 400);
      }

      // Verify staff exists and has appropriate role
      const User = require('../../models/User').default;
      const staff = await User.findById(staff_id);
      
      if (!staff || !['admin', 'staff'].includes(staff.role)) {
        return errorResponse(res, "Invalid staff member", {}, 400);
      }

      // Update service with assigned staff
      const updatedService = await BusinessService.findOneAndUpdate(
        { reference_number: referenceNumber },
        {
          assigned_staff: staff_id,
          internal_notes: notes ? `Staff assigned: ${notes}` : `Assigned to ${staff.first_name} ${staff.last_name}`,
          updated_at: new Date()
        },
        { new: true }
      ).populate('assigned_staff', 'first_name last_name email');

      if (!updatedService) {
        return errorResponse(res, "Service not found", {}, 404);
      }

      // Send notification email to assigned staff (optional)
      try {
        const { sendBusinessServiceAssignmentEmail } = require('../../services/email.service');
        await sendBusinessServiceAssignmentEmail(
          staff.email,
          `${staff.first_name} ${staff.last_name}`,
          updatedService.service_type,
          referenceNumber,
          updatedService.client_name || 'Unknown Client'
        );
      } catch (emailError) {
        console.error('Failed to send assignment email:', emailError);
        // Don't fail the assignment if email fails
      }

      return successResponse(
        res,
        "Staff assigned successfully",
        {
          service: updatedService,
          assigned_staff: {
            id: staff._id,
            name: `${staff.first_name} ${staff.last_name}`,
            email: staff.email
          }
        },
        200
      );
    } catch (error: any) {
      console.error('Assign staff error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get all pricing configurations (ADMIN)
  static async getAllPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Admin fetching all pricing configurations...');
      
      const pricing = await BusinessServicePricing.find({ is_active: true })
        .populate('created_by', 'first_name last_name email')
        .populate('updated_by', 'first_name last_name email')
        .sort({ service_type: 1, priority: 1 });

      console.log('📊 Found pricing records:', pricing.length);

      return successResponse(
        res,
        "Pricing configurations retrieved successfully",
        pricing,
        200
      );
    } catch (error: any) {
      console.error('❌ Get pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Create new pricing configuration
  static async createPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { service_type, priority, price, duration, description } = req.body;

      console.log('📝 Creating new pricing:', { service_type, priority, price });

      // Validate required fields
      if (!service_type || !priority || !price || !duration) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "service_type, priority, price, and duration are required" },
          400
        );
      }

      // Check if pricing already exists
      const existingPricing = await BusinessServicePricing.findOne({
        service_type,
        priority,
        is_active: true
      });

      if (existingPricing) {
        return errorResponse(
          res,
          "Pricing configuration already exists",
          { error: "A pricing configuration for this service type and priority already exists" },
          400
        );
      }

      // Create new pricing
      const newPricing = new BusinessServicePricing({
        service_type,
        priority,
        price: Number(price),
        duration,
        description,
        created_by: req.user?._id,
        is_active: true
      });

      await newPricing.save();

      console.log('✅ Created pricing:', newPricing._id);

      return successResponse(
        res,
        "Pricing configuration created successfully",
        newPricing,
        201
      );
    } catch (error: any) {
      console.error('❌ Create pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Update pricing configuration
  static async updatePricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { serviceType, priority } = req.params;
      const { price, duration, description } = req.body;

      console.log('🔄 Updating pricing:', { serviceType, priority, price });

      const pricing = await BusinessServicePricing.findOne({
        service_type: serviceType,
        priority: priority,
        is_active: true
      });

      if (!pricing) {
        return errorResponse(
          res,
          "Pricing configuration not found",
          {},
          404
        );
      }

      // Update fields
      if (price !== undefined) pricing.price = Number(price);
      if (duration !== undefined) pricing.duration = duration;
      if (description !== undefined) pricing.description = description;
      pricing.updated_by = req.user?._id;

      await pricing.save();

      console.log('✅ Updated pricing:', pricing._id);

      return successResponse(
        res,
        "Pricing configuration updated successfully",
        pricing,
        200
      );
    } catch (error: any) {
      console.error('❌ Update pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Delete pricing configuration
  static async deletePricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { serviceType, priority } = req.params;

      console.log('🗑️ Deleting pricing:', { serviceType, priority });

      const pricing = await BusinessServicePricing.findOne({
        service_type: serviceType,
        priority: priority,
        is_active: true
      });

      if (!pricing) {
        return errorResponse(
          res,
          "Pricing configuration not found",
          {},
          404
        );
      }

      // Soft delete by setting is_active to false
      pricing.is_active = false;
      pricing.updated_by = req.user?._id;
      await pricing.save();

      console.log('✅ Deleted pricing:', pricing._id);

      return successResponse(
        res,
        "Pricing configuration deleted successfully",
        {},
        200
      );
    } catch (error: any) {
      console.error('❌ Delete pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}