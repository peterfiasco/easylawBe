import Joi from 'joi';

export const BusinessRegistrationSchema = Joi.object({
  clientInfo: Joi.object({
    fullName: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().email().required().trim(),
    phone: Joi.string().required().trim().min(10).max(15),
    address: Joi.string().required().trim().min(10).max(500)
  }).required(),
  
  businessDetails: Joi.object({
    businessName: Joi.string().required().trim().min(2).max(200),
    businessType: Joi.string().required().valid(
      'private_limited', 'public_limited', 'partnership', 'sole_proprietorship', 'ngo', 'cooperative'
    ),
    businessAddress: Joi.string().required().trim().min(10).max(500),
    businessObjects: Joi.string().required().trim().min(20).max(2000)
  }).required(),
  
  directors: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(2).max(100),
      email: Joi.string().email().required().trim(),
      phone: Joi.string().required().trim().min(10).max(15),
      address: Joi.string().required().trim().min(10).max(500),
      nationality: Joi.string().required().trim().min(2).max(50),
      occupation: Joi.string().required().trim().min(2).max(100)
    })
  ).min(1).max(10).required(),
  
  shareholders: Joi.array().items(
    Joi.object({
      name: Joi.string().required().trim().min(2).max(100),
      email: Joi.string().email().required().trim(),
      shares: Joi.number().integer().min(1).required(),
      percentage: Joi.number().min(0.01).max(100).required()
    })
  ).min(1).max(50).required(),
  
  priority: Joi.string().valid('standard', 'express', 'urgent').default('standard'),
  additionalRequirements: Joi.string().allow('').max(1000)
});

export const DueDiligenceSchema = Joi.object({
  clientInfo: Joi.object({
    fullName: Joi.string().required().trim().min(2).max(100),
    email: Joi.string().email().required().trim(),
    phone: Joi.string().required().trim().min(10).max(15),
    company: Joi.string().allow('').trim().max(200),
    address: Joi.string().required().trim().min(10).max(500)
  }).required(),
  
  investigationDetails: Joi.object({
    investigationType: Joi.string().required().valid('individual', 'company', 'asset'),
    subjectName: Joi.string().required().trim().min(2).max(200),
    subjectDetails: Joi.string().required().trim().min(10).max(1000),
    investigationScope: Joi.array().items(
      Joi.string().valid(
        'background_check',
        'financial_verification',
        'criminal_records',
        'employment_history',
        'asset_verification',
        'business_registration',
        'litigation_history',
        'credit_check',
        'reference_verification',
        'social_media_analysis'
      )
    ).min(1).max(10).required(),
    urgencyLevel: Joi.string().required().valid('low', 'medium', 'high', 'critical'),
    timeframe: Joi.string().allow('').max(200),
    specificRequests: Joi.string().allow('').max(1000)
  }).required(),
  
  priority: Joi.string().valid('standard', 'express', 'urgent').default('standard'),
  additionalRequirements: Joi.string().allow('').max(1000)
});

export const UpdatePaymentStatusSchema = Joi.object({
  service_id: Joi.string().required().length(24), // MongoDB ObjectId length
  transaction_id: Joi.string().required().length(24),
  payment_status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required(),
  transaction_reference: Joi.string().required().trim().min(5).max(100)
});

export const UpdateServiceStatusSchema = Joi.object({
  status: Joi.string().valid(
    'submitted', 'pending', 'processing', 'review', 'under_review', 
    'approved', 'completed', 'failed', 'rejected'
  ).optional(),
  progress_percentage: Joi.number().min(0).max(100).optional(),
  status_message: Joi.string().trim().max(500).optional(),
  estimated_completion: Joi.date().iso().optional(),
  actual_completion: Joi.date().iso().optional(),
  assigned_staff: Joi.string().length(24).optional(), // MongoDB ObjectId
  internal_notes: Joi.string().trim().max(2000).optional()
}).min(1); // At least one field must be provided

export const AddDocumentSchema = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  type: Joi.string().required().trim().min(1).max(50),
  url: Joi.string().uri().required(),
  download_url: Joi.string().uri().required(),
  preview_url: Joi.string().uri().allow('').optional(),
  size: Joi.string().trim().max(20).optional()
});

export const CancelServiceSchema = Joi.object({
  reason: Joi.string().required().trim().min(5).max(500)
});