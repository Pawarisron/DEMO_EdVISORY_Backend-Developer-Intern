import { Category } from './../entities/Category';
import { Transaction } from './../entities/Transaction';
import { createTransactionByUserIdSchema } from './../schemas/transactions/createTransactionByUserIdSchema';
import { FastifyReply } from "fastify"
import { UserPrincipleRequest } from "../types/UserPrincipleRequest"
import { AppDataSource } from '../database/dataSource';
import { uploadTransactionSlipByIdSchema } from '../schemas/transactions/uploadTransactionSlipByIdSchema';
import { getAllTransactionByUserIdSchema } from '../schemas/transactions/getAllTransactionByUserIdSchema';
import path from 'path';
import fs from 'fs';
import { config } from '../../config';
const leoProfanity = require('leo-profanity'); //bad word filter

//Get all transaction filter
export const getAllTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        const {error, value} = getAllTransactionByUserIdSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        console.log(value)
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }
        //repo joined table
        const query = AppDataSource
        .getRepository(Transaction)
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.account', 'account')
        .leftJoinAndSelect('t.category', 'category')
        .where('t.user_id = :userId', { userId }); // only transaction that belong to this userId

        const month = value.month;
        const year = value.year;
        const type = value.type;
        const accountId = value.accountId;
        const categoryId = value.categoryId;

        //Filter month && year
        if (month && year) {
            query.andWhere('EXTRACT( MONTH FROM t.transaction_date ) = :month', { month });
            query.andWhere('EXTRACT( YEAR FROM t.transaction_date ) = :year', { year });
        }
        //Filter Type
        if(type){
            query.andWhere('category.type = :type', {type} );
        }
        //Filter AccountId
        if(accountId){
            query.andWhere('t.account.id = :accountId', {accountId} );
        }
        //Filter CategoryId
        if(categoryId){
            query.andWhere('t.category_id = :categoryId', { categoryId });
        }

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
        ])
        .getManyAndCount();
        return {
            data: transactions,
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

export const uploadTransactionSlipById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //Validation
        const {error, value} = uploadTransactionSlipByIdSchema.validate(req.params || null);
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const data = await req.file();
        if (!data) return reply.status(400).send({ error: 'No file uploaded' });
        //check file type
        if (!data.mimetype.startsWith('image/')) {
            return reply.status(400).send({ error: 'Only image files allowed' });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }

        //Repo
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const transactionId = value.id;

        const ext = path.extname(data.filename);
        const newFileName = `${Date.now()}${ext}`;
        
        //update DB
        const result = await transactionRepo.update({id: transactionId, user_id:userId} , {slip_path:newFileName})
        if (result.affected === 0) {
        return reply.status(404).send({
            message: 'Transaction not found or not have permission',
        });
        }

        //save file
        const uploadDir = path.resolve(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        const saveTo = path.join(uploadDir, newFileName);

        const writeStream = fs.createWriteStream(saveTo);
        await data.file.pipe(writeStream);
        
        reply.send({message: 'Upload image success', id:transactionId ,filename: newFileName}).code(201);

    }
    catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
}


