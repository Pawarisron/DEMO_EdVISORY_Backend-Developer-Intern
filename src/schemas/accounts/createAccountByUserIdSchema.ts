import Joi from "joi";

export const createAccountByUserIdSchema = Joi.object({
    name: Joi.string().required()
});