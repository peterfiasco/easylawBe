import Joi from "joi";

export const BookConsultationSchema = Joi.object({
    call_type: Joi.string().valid('video', 'phone').required(),
    date: Joi.date().required(),
    time: Joi.string().required()
})
export const BusinessSchema = Joi.object({
    name: Joi.string().required(),
    business: Joi.string().required()
})