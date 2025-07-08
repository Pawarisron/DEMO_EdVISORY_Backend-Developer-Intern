import Joi from "joi";

export const deleteCategoryByIdSchema = Joi.object({
    id: Joi.string().uuid().required()
});