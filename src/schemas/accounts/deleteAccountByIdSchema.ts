import Joi from "joi";

export const deleteAccountByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});