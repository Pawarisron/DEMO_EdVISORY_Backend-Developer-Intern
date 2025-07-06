import Joi from "@hapi/joi";

//validation
export const itemIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});
