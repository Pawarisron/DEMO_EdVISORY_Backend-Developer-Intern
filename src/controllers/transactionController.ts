import { createTransactionByUserIdSchema } from './../schemas/transactions/createTransactionByUserIdSchema';
import { FastifyReply } from "fastify"
import { UserPrincipleRequest } from "../types/UserPrincipleRequest"
import { AppDataSource } from '../database/dataSource';
import { Transaction } from '../entities/Transaction';
const leoProfanity = require('leo-profanity');

//Get all transaction filter
export const getAllTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{

}
//Get Single transaction
export const getTransactionById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{

}
//Create Transaction
export const createTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //Validation
        const {error, value} = createTransactionByUserIdSchema.validate(req.body || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }
        //Repo
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const categoryId = value.categoryId;
        const accountId = value.accountId;
        

        //Validate account and category belong to this user only
        const isValid = await AppDataSource
        .createQueryBuilder()
        .select('1')
        .from('accounts', 'a')
        .addFrom('categories', 'c')
        .where('a.id = :accountId', { accountId })
        .andWhere('c.id = :categoryId', { categoryId })
        .andWhere('a.user_id = :userId', { userId })
        .andWhere('c.user_id = :userId', { userId })
        .limit(1)
        .getRawOne();
        if(!isValid){
            return reply.status(403).send({ message: 'Unauthorized or not found' });
        }
        //Create Transaction
        const transaction = new Transaction();
        transaction.user_id = userId;
        transaction.account_id = accountId;
        transaction.category_id = categoryId;
        transaction.amount = value.amount;
        transaction.transaction_date = value.transactionDate;
        transaction.note_cleaned = leoProfanity.clean(value.note); //Filter Bad word          
        
        //save in db
        await transactionRepo.save(transaction);
        return reply.status(201).send({message: "transaction created",transaction:transaction})

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
}


