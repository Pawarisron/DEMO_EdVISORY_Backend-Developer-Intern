import Joi from "joi";
import { paginationSchema } from "../paginationSchema";

export const getAllTransactionByUserIdSchema = paginationSchema.keys({
    month:Joi.number().integer().min(1).max(12),
    year:Joi.number().integer().min(2000),
    type: Joi.string().valid('INCOME', 'EXPENSE'),
    accountId: Joi.string().uuid(),
    categoryId: Joi.string().uuid(),
})