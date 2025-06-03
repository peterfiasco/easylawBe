import { Response } from "express";
import { CustomRequest } from "../../middleware/authMiddleware";
import { errorResponse, successResponse } from "../../utils/response";
import DueDiligencePricing from "../../models/DueDiligencePricing";
import ServiceRequest from "../../models/ServiceRequest"; // Add this import

export class AdminDueDiligenceController {
  // Get all pricing configurations (ADMIN)
  static async getAllPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Admin fetching all due diligence pricing configurations...');
      
      const pricing = await DueDiligencePricing.find({ is_active: true })
        .populate('created_by', 'first_name last_name email')
        .populate('updated_by', 'first_name last_name email')
        .sort({ investigation_type: 1, priority: 1 });

      console.log('📊 Found pricing records:', pricing.length);

      return successResponse(
        res,
        "Due diligence pricing configurations retrieved successfully",
        pricing,
        200
      );
    } catch (error: any) {
      console.error('❌ Get due diligence pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }


  // Add these methods to the AdminDueDiligenceController class

  // Get investigation details by reference number
  static async getInvestigationDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;

      console.log('🔍 Admin fetching investigation details:', referenceNumber);

      const investigation = await ServiceRequest.findOne({ 
        reference_number: referenceNumber,
        service_type: 'due_diligence' 
      })
        .populate('user_id', 'first_name last_name email phone')
        .populate('assigned_to', 'first_name last_name email');

      if (!investigation) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      console.log('✅ Investigation details retrieved successfully');

      return successResponse(
        res,
        "Investigation details retrieved successfully",
        investigation,
        200
      );
    } catch (error: any) {
      console.error('❌ Get investigation details error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Delete (cancel) investigation
  static async deleteInvestigation(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;

      console.log('🗑️ Admin deleting investigation:', referenceNumber);

      const investigation = await ServiceRequest.findOneAndUpdate(
        { 
          reference_number: referenceNumber,
          service_type: 'due_diligence' 
        },
        {
          status: 'cancelled',
          updated_at: new Date(),
          notes: [
            ...((await ServiceRequest.findOne({ reference_number: referenceNumber }))?.notes || []),
            {
              message: 'Investigation cancelled by admin',
              added_by: req.user?._id,
              date: new Date(),
              type: 'admin'
            }
          ]
        },
        { new: true }
      );

      if (!investigation) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      console.log('✅ Investigation cancelled successfully');

      return successResponse(
        res,
        "Investigation cancelled successfully",
        { reference_number: referenceNumber },
        200
      );
    } catch (error: any) {
      console.error('❌ Delete investigation error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Add document to investigation
  static async addDocument(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params;
      const { document_type, description } = req.body;

      console.log('📄 Admin adding document to investigation:', referenceNumber);

      if (!req.file) {
        return errorResponse(res, "No file uploaded", {}, 400);
      }

      const investigation = await ServiceRequest.findOne({ 
        reference_number: referenceNumber,
        service_type: 'due_diligence' 
      });

      if (!investigation) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      // ✅ FIX: Create document object with required file_buffer
      const newDocument = {
        name: req.file.originalname, // Required field
        url: `/uploads/${req.file.filename}`, // Required field  
        upload_date: new Date(), // Required field
        document_type: document_type || 'investigation_report', // Required field
        file_buffer: req.file.buffer, // ✅ ADD: Required file_buffer field
        file_size: req.file.size, // Required field
        mime_type: req.file.mimetype, // Required field
        // Optional additional fields
        description: description || 'Investigation document',
        file_path: req.file.path,
        uploaded_by: req.user?._id,
        download_url: `/uploads/${req.file.filename}`
      };

      investigation.documents.push(newDocument);
      await investigation.save();

      console.log('✅ Document added successfully');

      return successResponse(
        res,
        "Document added successfully",
        newDocument,
        201
      );
    } catch (error: any) {
      console.error('❌ Add document error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }


  // Get public pricing (no auth required) - ADD THIS METHOD
  static async getPublicPricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Fetching public due diligence pricing...');
      
      const pricingRecords = await DueDiligencePricing.find({ is_active: true })
        .select('investigation_type priority price duration description features')
        .sort({ investigation_type: 1, priority: 1 });

      // Transform to the expected format
      const pricingData: any = {};
      
      pricingRecords.forEach(record => {
        if (!pricingData[record.investigation_type]) {
          pricingData[record.investigation_type] = {};
        }
        
        pricingData[record.investigation_type][record.priority] = {
          price: record.price,
          duration: record.duration,
          description: record.description,
          features: record.features || []
        };
      });

      console.log('📊 Public pricing data formatted:', pricingData);

      return successResponse(
        res,
        "Due diligence pricing retrieved successfully",
        pricingData,
        200
      );
    } catch (error: any) {
      console.error('❌ Get public due diligence pricing error:', error);
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
      const { investigation_type, priority, price, duration, description, features } = req.body;

      // 🔍 DEBUG: Log original values
      console.log('📝 Creating new due diligence pricing:');
      console.log('Original price from request:', price, typeof price);
      console.log('Full request body:', req.body);

      // Validate required fields
      if (!investigation_type || !priority || !price || !duration) {
        return errorResponse(
          res,
          "Missing required fields",
          { error: "investigation_type, priority, price, and duration are required" },
          400
        );
      }

      // 🔍 DEBUG: Log conversion
      const parsedPrice = parseFloat(price);
      console.log('Parsed price:', parsedPrice, typeof parsedPrice);

      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return errorResponse(
          res,
          "Invalid price",
          { error: "Price must be a valid positive number" },
          400
        );
      }

      // FIXED: Check if pricing already exists (including inactive records)
      const existingPricing = await DueDiligencePricing.findOne({
        investigation_type,
        priority
      });

      if (existingPricing) {
        if (existingPricing.is_active) {
          return errorResponse(
            res,
            "Pricing configuration already exists",
            { error: "An active pricing configuration for this investigation type and priority already exists" },
            400
          );
        } else {
          // Reactivate existing inactive record
          const updatedPricing = await DueDiligencePricing.findByIdAndUpdate(
            existingPricing._id,
            {
              price: parsedPrice, // 🔍 Use parsed price
              duration,
              description,
              features: features || [],
              is_active: true,
              updated_by: req.user?._id,
              updated_at: new Date()
            },
            { new: true, runValidators: true }
          ).populate('created_by updated_by', 'first_name last_name email');

          console.log('✅ Reactivated existing due diligence pricing with price:', updatedPricing?.price);

          return successResponse(
            res,
            "Due diligence pricing configuration reactivated and updated successfully",
            updatedPricing,
            200
          );
        }
      }

      // Create new pricing
      const pricingData = {
        investigation_type,
        priority,
        price: parsedPrice, // 🔍 Use parsed price
        duration,
        description,
        features: features || [],
        created_by: req.user?._id,
        is_active: true
      };

      // 🔍 DEBUG: Log data before saving
      console.log('Data to be saved:', pricingData);

      const newPricing = new DueDiligencePricing(pricingData);
      await newPricing.save();

      // 🔍 DEBUG: Log saved data
      console.log('✅ Created due diligence pricing with price:', newPricing.price);

      const populatedPricing = await DueDiligencePricing.findById(newPricing._id)
        .populate('created_by', 'first_name last_name email');

      // 🔍 DEBUG: Log final result
      console.log('Final populated pricing:', populatedPricing?.price);

      return successResponse(
        res,
        "Due diligence pricing configuration created successfully",
        populatedPricing,
        201
      );
    } catch (error: any) {
      console.error('❌ Create due diligence pricing error:', error);
      
      // Handle MongoDB duplicate key error specifically
      if (error.code === 11000) {
        const duplicateField = error.message.match(/dup key: \{ (.+?) \}/)?.[1] || 'unknown field';
        return errorResponse(
          res,
          "Duplicate pricing configuration",
          { 
            error: "A pricing configuration with these details already exists",
            details: duplicateField
          },
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
      const { price, duration, description, features, is_active } = req.body;

      console.log('🔄 Updating due diligence pricing:', id);

      // Check if trying to update investigation_type or priority (not allowed)
      if (req.body.investigation_type || req.body.priority) {
        return errorResponse(
          res,
          "Invalid update operation",
          { error: "Investigation type and priority cannot be modified. Create a new pricing configuration instead." },
          400
        );
      }

      const updatedPricing = await DueDiligencePricing.findByIdAndUpdate(
        id,
        {
          ...(price && { price: Number(price) }),
          ...(duration && { duration }),
          ...(description !== undefined && { description }),
          ...(features && { features }),
          ...(is_active !== undefined && { is_active }),
          updated_by: req.user?._id,
          updated_at: new Date()
        },
        { new: true, runValidators: true }
      ).populate('created_by updated_by', 'first_name last_name email');

      if (!updatedPricing) {
        return errorResponse(res, "Pricing configuration not found", {}, 404);
      }

      console.log('✅ Updated due diligence pricing successfully');

      return successResponse(
        res,
        "Due diligence pricing configuration updated successfully",
        updatedPricing,
        200
      );
    } catch (error: any) {
      console.error('❌ Update due diligence pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Delete (deactivate) pricing configuration
  static async deletePricing(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log('🗑️ Deactivating due diligence pricing:', id);

      const updatedPricing = await DueDiligencePricing.findByIdAndUpdate(
        id,
        {
          is_active: false,
          updated_by: req.user?._id,
          updated_at: new Date()
        },
        { new: true }
      );

      if (!updatedPricing) {
        return errorResponse(res, "Pricing configuration not found", {}, 404);
      }

      console.log('✅ Deactivated due diligence pricing successfully');

      return successResponse(
        res,
        "Due diligence pricing configuration deactivated successfully",
        { id: updatedPricing._id },
        200
      );
    } catch (error: any) {
      console.error('❌ Delete due diligence pricing error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get pricing analytics
  static async getPricingAnalytics(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('📊 Fetching due diligence pricing analytics...');

      const analytics = await DueDiligencePricing.aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: {
              investigation_type: '$investigation_type',
              priority: '$priority'
            },
            average_price: { $avg: '$price' },
            min_price: { $min: '$price' },
            max_price: { $max: '$price' },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.investigation_type',
            pricing_data: {
              $push: {
                priority: '$_id.priority',
                average_price: '$average_price',
                min_price: '$min_price',
                max_price: '$max_price',
                count: '$count'
              }
            },
            total_configurations: { $sum: '$count' }
          }
        }
      ]);

      return successResponse(
        res,
        "Due diligence pricing analytics retrieved successfully",
        analytics,
        200
      );
    } catch (error: any) {
      console.error('❌ Get due diligence pricing analytics error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Get all investigations (ADMIN)
  static async getAllInvestigations(req: CustomRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 Admin fetching all due diligence investigations...');
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;
      
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      
      // Build filter
      const filter: any = { service_type: 'due_diligence' };
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const investigations = await ServiceRequest.find(filter)
        .populate('user_id', 'first_name last_name email phone')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ServiceRequest.countDocuments(filter);

      console.log('📊 Found investigations:', investigations.length);

      return successResponse(
        res,
        "Due diligence investigations retrieved successfully",
        {
          investigations,
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
      console.error('❌ Get all investigations error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }

  // Update investigation status (ADMIN)
  static async updateInvestigationStatus(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { referenceNumber } = req.params; // FIXED: Changed from reference_number to referenceNumber
      const { status, notes } = req.body;

      console.log('🔄 Updating investigation status:', referenceNumber, 'to:', status);

      const validStatuses = ['submitted', 'in_progress', 'requires_action', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return errorResponse(
          res,
          "Invalid status",
          { error: "Status must be one of: " + validStatuses.join(', ') },
          400
        );
      }

      const updateData: any = {
        status,
        updated_at: new Date()
      };

      if (status === 'completed') {
        updateData.actual_completion = new Date();
      }

      const investigation = await ServiceRequest.findOneAndUpdate(
        { reference_number: referenceNumber, service_type: 'due_diligence' }, // FIXED: Use referenceNumber
        updateData,
        { new: true, runValidators: true }
      ).populate('user_id', 'first_name last_name email');

      if (!investigation) {
        return errorResponse(res, "Investigation not found", {}, 404);
      }

      // Add admin note if provided
      if (notes) {
        investigation.notes.push({
          message: notes,
          added_by: req.user?._id,
          date: new Date(),
          type: 'admin'
        });
        await investigation.save();
      }

      console.log('✅ Investigation status updated successfully');

      return successResponse(
        res,
        "Investigation status updated successfully",
        investigation,
        200
      );
    } catch (error: any) {
      console.error('❌ Update investigation status error:', error);
      return errorResponse(
        res,
        "Internal Server Error",
        { error: error.message },
        500
      );
    }
  }
}
