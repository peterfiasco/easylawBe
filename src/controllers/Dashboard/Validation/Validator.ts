import Joi from 'joi';

// Update the BookConsultationSchema
export const BookConsultationSchema = Joi.object({
  consultation_type_id: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  reason: Joi.string().required().min(10).max(500)
})

export const BusinessSchema = Joi.object({
    name: Joi.string().required(),
    business: Joi.string().required()
})