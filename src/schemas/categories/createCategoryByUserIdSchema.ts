import Joi from "joi";

export const createCategoryByUserIdSchema = Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('INCOME', 'EXPENSE').required()
});