// schemas/paginationSchema.ts
import Joi from "joi";
import { config } from "../config/config";

//Pagination validation
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().valid(...config.allowedPageSize).default(config.allowedPageSize[0]),
});
