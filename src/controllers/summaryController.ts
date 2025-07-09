import { FastifyReply } from "fastify";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import { getSummaryByUserIdSchema } from "../schemas/summary/getSummaryByUserIdSchema";
import { AppDataSource } from "../database/dataSource";
import { Transaction } from "../entities/Transaction";
import { config } from "../../config";

//get summary 
export const getSummaryByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //validation
        const {error, value} = getSummaryByUserIdSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }

        const mode = value.mode;
        const date = value.date;
        const month = value.month;
        const year = value.year;
        const from = value.from;
        const to = value.to;
        const accountId = value.accountId;

        //repo joined table
        const query = AppDataSource.getRepository(Transaction)
        .createQueryBuilder('t')
        .leftJoin('t.category', 'category')
        .leftJoin('t.account', 'account')
        .where('t.user_id = :userId', { userId });
        
        //Filter
        if (mode === 'day') {
            query.andWhere('t.transaction_date = :date', { date });
        
        } else if (mode === 'month') {
            query.andWhere('EXTRACT( MONTH FROM t.transaction_date ) = :month', { month });
            query.andWhere('EXTRACT( YEAR FROM t.transaction_date ) = :year', { year });

        } else if (mode === 'year') {
            query.andWhere('EXTRACT( YEAR FROM t.transaction_date ) = :year', { year });

        } else if (mode === 'range') {
            query.andWhere('t.transaction_date BETWEEN :from AND :to', { from, to });
        }

        if (accountId) query.andWhere('t.account_id = :accountId', { accountId });

        // sum income
        const incomeResult = await query.clone()
        .andWhere('category.type = :type', { type: 'INCOME' })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

        // sum outcome
        const expenseResult = await query.clone()
        .andWhere('category.type = :type', { type: 'EXPENSE' })
        .select('SUM(t.amount)', 'total')
        .getRawOne();

        const income = parseFloat(incomeResult?.total || '0');
        const expense = parseFloat(expenseResult?.total || '0');

        // Pagination
        const page = value.page || 1;
        const size = config.allowedPageSize.includes(value.size) ? value.size : config.allowedPageSize[0];
        const skip = (page  - 1) * size;
        const [transactions, total] = await query
        .orderBy('t.transaction_date', 'DESC')
        .skip(skip)
        .take(size)
        .select([
            't.id',
            't.user_id',
            't.amount',
            't.transaction_date',
            'category.name',
            'account.name',
            't.note_cleaned'
        ])
        .getManyAndCount();

        return {
            transaction: transactions,
            summary: {
                Income: income,
                Expense: expense,
                Balance: income - expense,
            },
            mode,
            range: {
                from,
                to,
            },
            pagination: {
                total,
                page,
                size: size,
                totalPages: Math.ceil(total / size),
            }
        };

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
    
}

//get summary allowance
export const getSummaryAllowanceByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{






    

        
    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
}