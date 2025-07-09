import Joi from "joi";
import { paginationSchema } from "../paginationSchema";

export const getSummaryByUserIdSchema = paginationSchema.keys({
    mode:Joi.string().valid('day','month','year','range').required(),
    //date
    date:Joi.when('mode',{
        is: 'day',
        then: Joi.date().iso().required(),
        otherwise: Joi.forbidden(),
    }),
    //month
    month: Joi.when('mode', {
        is: 'month',
        then: Joi.number().integer().min(1).max(12).required(),
        otherwise: Joi.forbidden(),
    }),
    //year
    year: Joi.when('mode', {
        is: Joi.valid('month', 'year'),
        then: Joi.number().integer().min(2000).required(),
        otherwise: Joi.forbidden(),
    }),
    //from
    from: Joi.when('mode', {
        is: 'range',
        then: Joi.date().iso().required(),
        otherwise: Joi.forbidden(),
    }),
    //to (to >= from)
    to: Joi.when('mode', {
        is: 'range',
        then: Joi.date().iso().min(Joi.ref('from')).required(),
        otherwise: Joi.forbidden(),
    }),
    //accountId
    accountId: Joi.string().uuid().optional(),

});