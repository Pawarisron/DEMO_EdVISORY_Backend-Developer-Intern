import Joi from "joi";

export const uploadTransactionSlipByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});