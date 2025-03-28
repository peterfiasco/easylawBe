import Joi from "joi";

export const PaymentValidationSchema = Joi.object({
    reason: Joi.string().valid('subscription', 'consultation').required(),
    transactionRef: Joi.string().required(),
    consultation_id: Joi.string().when('reason', {
        is: 'consultation',
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      }),
})