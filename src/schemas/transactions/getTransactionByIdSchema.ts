import Joi from "joi";

export const getTransactionByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});