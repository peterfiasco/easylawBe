import Joi from "joi";

export const RegisterSchema = Joi.object({
    first_name: Joi.string().max(20).required(),
    last_name: Joi.string().max(20).required(),
    email: Joi.string().required(),
    phone_number: Joi.number().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({ 'any.only': 'Confirm password must match password' }),
    
    // Make company-related fields optional
    company_name: Joi.string().optional(),
    website: Joi.string().optional().allow('', null),
    business_type: Joi.string()
        .valid('llc', 'corporation', 'partnership', 'sole-proprietorship', 'Individual')
        .optional(),
    address: Joi.string().optional(),
    
    // Better approach for agree_with_terms that handles multiple possible values
    agree_with_terms: Joi.alternatives()
        .try(
            Joi.boolean().valid(true),
            Joi.string().valid('true', 'on', '1')
        )
        .required()
        .messages({
            'any.only': 'You must agree to the terms and conditions',
            'any.required': 'Agreement to terms is required'
        })
})

export const LoginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(6).required(),
})
