import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import BusinessServicePricing from "../../models/BusinessServicePricing";

export class AdminBusinessServicePricingController {
  // Get all pricing configurations
  static async getAllPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { service_type, is_active } = req.query;

      // Build query
      const query: any = {};
      if (service_type && service_type !== 'all') query.service_type = service_type;
      if (is_active !== undefined) query.is_active = is_active === 'true';

      const pricing = await BusinessServicePricing.find(query)
        .populate('created_by', 'first_name last_name email')
        .populate('updated_by', 'first_name last_name email')
        .sort({ service_type: 1, priority: 1 });

      // Group by service type for better organization
      const groupedPricing = pricing.reduce((acc: any, item) => {
        if (!acc[item.service_type]) {
          acc[item.service_type] = {};
        }
        acc[item.service_type][item.priority] = {
          id: item._id,
          price: item.price,
          duration: item.duration,
          description: item.description,
          is_active: item.is_active,
          created_by: item.created_by,
          updated_by: item.updated_by,
          created_at: item.created_at,
          updated_at: item.updated_at
        };
        return acc;
      }, {});

      return successResponse(
        res,
        "Pricing configurations retrieved successfully",
        {
          pricing: groupedPricing,
          raw_pricing: pricing
        },
        200
      );
    } catch (error: any) {
      console.error('Get all pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get pricing for a specific service type
  static async getPricingByServiceType(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { serviceType } = req.params;

      const pricing = await BusinessServicePricing.find({
        service_type: serviceType,
        is_active: true
      }).sort({ priority: 1 });

      if (pricing.length === 0) {
        return errorResponse(
          res,
          "No pricing found for this service type",
          {},
          404
        );
      }

      // Format response
      const formattedPricing = pricing.reduce((acc: any, item) => {
        acc[item.priority] = {
          price: item.price,
          duration: item.duration,
          description: item.description
        };
        return acc;
      }, {});

      return successResponse(
        res,
        "Pricing retrieved successfully",
        formattedPricing,
        200
      );
    } catch (error: any) {
      console.error('Get pricing by service type error:', error);
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
      const userId = req.user?._id || req.user?.user_id;

      if (!service_type || !priority || !price || !duration) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "service_type, priority, price, and duration are required" },
          400
        );
      }

      // Check if pricing already exists for this service_type + priority combination
      const existingPricing = await BusinessServicePricing.findOne({
        service_type,
        priority
      });

      if (existingPricing) {
        return errorResponse(
          res,
          "Pricing already exists for this service type and priority",
          { error: "Use update endpoint to modify existing pricing" },
          409
        );
      }

      const newPricing = new BusinessServicePricing({
        service_type,
        priority,
        price: Number(price),
        duration,
        description,
        created_by: userId
      });

      await newPricing.save();

      return successResponse(
        res,
        "Pricing configuration created successfully",
        newPricing,
        201
      );
    } catch (error: any) {
      console.error('Create pricing error:', error);
      if (error.code === 11000) {
        return errorResponse(
          res,
          "Pricing already exists for this service type and priority",
          { error: "Duplicate pricing configuration" },
          409
        );
      }
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
      const { id } = req.params;
      const { price, duration, description, is_active } = req.body;
      const userId = req.user?._id || req.user?.user_id;

      const pricing = await BusinessServicePricing.findById(id);

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
      if (is_active !== undefined) pricing.is_active = is_active;
      
      pricing.updated_by = userId;

      await pricing.save();

      return successResponse(
        res,
        "Pricing configuration updated successfully",
        pricing,
        200
      );
    } catch (error: any) {
      console.error('Update pricing error:', error);
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
      const { id } = req.params;

      const pricing = await BusinessServicePricing.findById(id);

      if (!pricing) {
        return errorResponse(
          res,
          "Pricing configuration not found",
          {},
          404
        );
      }

      await BusinessServicePricing.findByIdAndDelete(id);

      return successResponse(
        res,
        "Pricing configuration deleted successfully",
        {},
        200
      );
    } catch (error: any) {
      console.error('Delete pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Bulk update pricing
  static async bulkUpdatePricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { pricing_updates } = req.body;
      const userId = req.user?._id || req.user?.user_id;

      if (!Array.isArray(pricing_updates) || pricing_updates.length === 0) {
        return errorResponse(
          res,
          "Invalid pricing updates format",
          { error: "pricing_updates must be a non-empty array" },
          400
        );
      }

      const updatePromises = pricing_updates.map(async (update: any) => {
        const { service_type, priority, price, duration, description } = update;

        return BusinessServicePricing.findOneAndUpdate(
          { service_type, priority },
          {
            price: Number(price),
            duration,
            description,
            updated_by: userId
          },
          { 
            new: true, 
            upsert: true,
            setDefaultsOnInsert: true
          }
        );
      });

      const results = await Promise.allSettled(updatePromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return successResponse(
        res,
        "Bulk pricing update completed",
        {
          successful_updates: successful,
          failed_updates: failed,
          total_updates: pricing_updates.length
        },
        200
      );
    } catch (error: any) {
      console.error('Bulk update pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get public pricing (for frontend form)
  static async getPublicPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const pricing = await BusinessServicePricing.find({
        is_active: true
      }).select('service_type priority price duration description');

      // Group by service type for easier frontend consumption
      const groupedPricing = pricing.reduce((acc: any, item) => {
        if (!acc[item.service_type]) {
          acc[item.service_type] = {};
        }
        acc[item.service_type][item.priority] = {
          price: item.price,
          duration: item.duration,
          description: item.description
        };
        return acc;
      }, {});

      return successResponse(
        res,
        "Public pricing retrieved successfully",
        groupedPricing,
        200
      );
    } catch (error: any) {
      console.error('Get public pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}