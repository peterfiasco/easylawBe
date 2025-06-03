import Joi from 'joi';

// Business Registration Validation
export const BusinessRegistrationSchema = Joi.object({
  business_name: Joi.string().min(2).max(100).required()
    .messages({
      'string.empty': 'Business name is required',
      'string.min': 'Business name must be at least 2 characters',
      'string.max': 'Business name cannot exceed 100 characters'
    }),
    
  business_type: Joi.string()
    .valid('limited_liability', 'public_company', 'private_company', 'partnership', 'sole_proprietorship')
    .required()
    .messages({
      'any.only': 'Invalid business type',
      'any.required': 'Business type is required'
    }),
    
  registration_type: Joi.string()
    .valid('incorporation', 'annual_filing', 'change_of_directors', 'change_of_address')
    .required()
    .messages({
      'any.only': 'Invalid registration type',
      'any.required': 'Registration type is required'
    }),
    
  proposed_names: Joi.array().items(Joi.string().max(100)).max(3)
    .messages({
      'array.max': 'Maximum 3 proposed names allowed'
    }),
    
  business_address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postal_code: Joi.string(),
    country: Joi.string().default('Nigeria')
  }).required(),
  
  directors: Joi.array().items(
    Joi.object({
      full_name: Joi.string().required(),
      nationality: Joi.string().required(),
      address: Joi.string().required(),
      phone: Joi.string(),
      email: Joi.string().email()
    })
  ),
  
  shareholders: Joi.array().items(
    Joi.object({
      full_name: Joi.string().required(),
      shares: Joi.number().positive().required(),
      share_type: Joi.string().default('ordinary')
    })
  ),
  
  business_objectives: Joi.array().items(Joi.string()),
  
  authorized_share_capital: Joi.number().positive().default(100000)
    .messages({
      'number.positive': 'Authorized share capital must be a positive number'
    }),
    
  issued_share_capital: Joi.number().positive().default(100000)
    .messages({
      'number.positive': 'Issued share capital must be a positive number'
    }),
    
  priority: Joi.string().valid('standard', 'express', 'urgent').default('standard')
    .messages({
      'any.only': 'Priority must be standard, express, or urgent'
    })
});

// Due Diligence Validation
export const DueDiligenceSchema = Joi.object({
  investigation_type: Joi.string()
    .valid('land_title', 'corporate_records', 'investment_check', 'comprehensive')
    .required()
    .messages({
      'any.only': 'Invalid investigation type',
      'any.required': 'Investigation type is required'
    }),
    
  subject_details: Joi.object({
    name: Joi.string().required()
      .messages({
        'string.empty': 'Subject name is required'
      }),
    type: Joi.string().valid('individual', 'company', 'property').required(),
    registration_number: Joi.string().when('type', {
      is: 'company',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    address: Joi.string(),
    additional_info: Joi.string()
  }).required(),
  
  investigation_scope: Joi.array().items(
    Joi.string().valid(
      'financial_records',
      'legal_compliance',
      'ownership_verification',
      'litigation_history',
      'asset_verification',
      'reputation_check'
    )
  ),
  
  priority: Joi.string().valid('standard', 'express', 'urgent').default('standard')
});

// IP Protection Validation
export const IPProtectionSchema = Joi.object({
  protection_type: Joi.string()
    .valid('trademark', 'copyright', 'patent', 'industrial_design', 'dispute_resolution')
    .required()
    .messages({
      'any.only': 'Invalid protection type',
      'any.required': 'Protection type is required'
    }),
    
  application_details: Joi.object({
    title: Joi.string().required()
      .messages({
        'string.empty': 'Application title is required'
      }),
    description: Joi.string().required(),
    classification: Joi.string(),
    priority_claim: Joi.boolean().default(false)
  }).required(),
  
  applicant_info: Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    nationality: Joi.string().required(),
    entity_type: Joi.string().valid('individual', 'company').required()
  }).required(),
  
  trademark_details: Joi.when('protection_type', {
    is: 'trademark',
    then: Joi.object({
      mark_type: Joi.string().valid('word', 'logo', 'combined').required(),
      classes: Joi.array().items(Joi.number().min(1).max(45)).required(),
      goods_services: Joi.string().required(),
      first_use_date: Joi.date(),
      logo_file: Joi.string()
    }),
    otherwise: Joi.optional()
  }),
  
  patent_details: Joi.when('protection_type', {
    is: 'patent',
    then: Joi.object({
      invention_type: Joi.string().valid('utility', 'design', 'plant').required(),
      technical_field: Joi.string().required(),
      background_art: Joi.string(),
      invention_summary: Joi.string().required(),
      claims: Joi.array().items(Joi.string()).required()
    }),
    otherwise: Joi.optional()
  }),
  
  copyright_details: Joi.when('protection_type', {
    is: 'copyright',
    then: Joi.object({
      work_type: Joi.string().valid('literary', 'artistic', 'musical', 'software').required(),
      creation_date: Joi.date().required(),
      publication_date: Joi.date(),
      authors: Joi.array().items(Joi.string()).required()
    }),
    otherwise: Joi.optional()
  }),
  
  dispute_details: Joi.when('protection_type', {
    is: 'dispute_resolution',
    then: Joi.object({
      dispute_type: Joi.string().valid('infringement', 'opposition', 'invalidation').required(),
      opposing_party: Joi.string().required(),
      case_summary: Joi.string().required(),
      evidence_available: Joi.boolean().default(false)
    }),
    otherwise: Joi.optional()
  }),
  
  priority: Joi.string().valid('standard', 'express', 'urgent').default('standard')
});

// Document Upload Validation
export const DocumentUploadSchema = Joi.object({
  document_category: Joi.string()
    .valid('incorporation_docs', 'financial_records', 'legal_docs', 'identity_docs', 'supporting_docs')
    .default('general'),
    
  description: Joi.string().max(500)
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
    
  tags: Joi.array().items(Joi.string()).max(10)
    .messages({
      'array.max': 'Maximum 10 tags allowed'
    }),
    
  access_level: Joi.string()
    .valid('public', 'client_only', 'admin_only', 'restricted')
    .default('client_only')
});

// Service Request Update Validation
export const ServiceUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('submitted', 'in_review', 'in_progress', 'requires_action', 'completed', 'cancelled'),
    
  priority: Joi.string().valid('standard', 'express', 'urgent'),
  
  notes: Joi.string().max(1000),
  
  estimated_completion: Joi.date().min('now')
    .messages({
      'date.min': 'Estimated completion date cannot be in the past'
    })
});