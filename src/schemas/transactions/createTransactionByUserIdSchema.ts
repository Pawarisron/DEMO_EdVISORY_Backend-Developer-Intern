import Joi from "joi";

export const createTransactionByUserIdSchema = Joi.object({
    accountId:Joi.string().uuid().required(),
    categoryId:Joi.string().uuid().required(),
    amount:Joi.number().required().positive(),
    transactionDate:Joi.date().iso().required(),
    note:Joi.string().allow(''),
})