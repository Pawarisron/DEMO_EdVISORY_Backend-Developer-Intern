import Joi from "joi";

export const createTransactionByUserIdSchema = Joi.object({
    accountId:Joi.string().uuid().required(),
    categoryId:Joi.string().uuid().required(),
    amount:Joi.number().required(),
    transactionDate:Joi.date().required(),
    note:Joi.string().allow(''),
})