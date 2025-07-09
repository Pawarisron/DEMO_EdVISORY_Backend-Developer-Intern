import Joi from "joi";
import { paginationSchema } from "../paginationSchema";

export const getSummaryAllowanceByUserIdSchema = paginationSchema.keys({
    mode: Joi.string().valid("actual","expect").required(),
    today: Joi.date().iso().required(),
    payday: Joi.date().iso().greater(Joi.ref("today")).required(),
    monthlyExpense: Joi.when("mode",{
        is: "expect",
        then: Joi.number().min(0).required(),
        otherwise: Joi.forbidden(), 
    }),
    accountId: Joi.string().uuid().optional(),
    //export
    format: Joi.string().valid("excel").optional(),
});