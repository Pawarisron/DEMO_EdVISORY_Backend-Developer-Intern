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
import { config } from '../config/config';
import { getTransactionByIdSchema } from '../schemas/transactions/getTransactionByIdSchema';
import ExcelJS from 'exceljs';
const leoProfanity = require('leo-profanity'); //bad word filter

//Get all transaction filter
export const getAllTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        const {error, value} = getAllTransactionByUserIdSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
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
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }



}
//Get Single transaction
export const getTransactionById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //validation
        const {error, value} = getTransactionByIdSchema.validate(req.params || null);
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        //check userId
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
        }

        //get single transaction
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const transaction = await transactionRepo.findOne({where:{
            id:value.id,
            user_id:userId,
        } });
        if(!transaction){
            return reply.status(403).send({ message: req.i18n.t("err_unauthorized_or_not_found")});
        }
        return reply.status(200).send({
            status:"success",
            data:transaction,
        })  
        
    }
    catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }


    
}
//Create Transaction
export const createTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //Validation
        const {error, value} = createTransactionByUserIdSchema.validate(req.body || null)
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
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
            return reply.status(403).send({ message: req.i18n.t("err_unauthorized_or_not_found") });
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
        return reply.status(201).send({message: req.i18n.t("transaction_created"),transaction:transaction})

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }
}
//Upload Transaction slip
export const uploadTransactionSlipById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //Validation
        const {error, value} = uploadTransactionSlipByIdSchema.validate(req.params || null);
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const data = await req.file();
        if (!data) return reply.status(400).send({ error: req.i18n.t('no_file_uploaded') });
        //check file type
        if (!data.mimetype.startsWith('image/')) {
            return reply.status(400).send({ error: req.i18n.t("only_image_files_allowed") });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
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
            message: req.i18n.t('transaction_not_found'),
        });
        }

        //save file
        const uploadDir = path.resolve(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
        const saveTo = path.join(uploadDir, newFileName);

        const writeStream = fs.createWriteStream(saveTo);
        await data.file.pipe(writeStream);
        
        reply.send({message: req.i18n.t("upload_image_success"), id:transactionId ,filename: newFileName}).code(201);

    }
    catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }
}
//import transaction excel (ADMIN ONLY)
export const importTransactionByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //Validate
        const file = await req.file();
        if(!file){
            return reply.code(400).send({ error: req.i18n.t("no_file_uploaded") });
        }
        if (!file.filename.endsWith('.xlsx') || file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
         return reply.code(400).send({ error: req.i18n.t("only_excel_files_are_allowed") });
        }
        const userId = req.user?.id;
        //check of admin id
        if(!userId || userId != config.adminId){ 
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
        }
        //Load buffer
        const buffer = await file.toBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);
        //Validate sheet
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) return reply.code(400).send({ error: req.i18n.t("no_worksheet_found") });
        //Repo
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const rowsToInsert: Transaction[] = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;
             //Create Transaction
            try {
                const transaction = new Transaction();
                transaction.user_id = row.getCell(1).value?.toString().trim() || '';
                transaction.account_id = row.getCell(2).value?.toString().trim() || '';
                transaction.category_id = row.getCell(3).value?.toString().trim() || '';
                transaction.amount = Number(row.getCell(4).value);
                transaction.transaction_date = new Date(row.getCell(5).value as string).toISOString();
                transaction.note_cleaned = leoProfanity.clean(row.getCell(6).value?.toString().trim() || ''); //Filter Bad word 
                rowsToInsert.push(transaction);  
            } catch (rowErr) {
                throw new Error(`${req.i18n.t("error_parsing_row")}${rowNumber}: ${(rowErr as Error).message}`);
            }      
        });
        //save in repo
        await transactionRepo.save(rowsToInsert);
        return reply.send({
            message: req.i18n.t("import_transaction_successfully"),
            total: rowsToInsert.length
        });
    }
    catch(error:any){
        if (error.code === 'FST_INVALID_MULTIPART_CONTENT_TYPE') {
            return reply.code(406).send({ error: req.i18n.t("no_file_uploaded") });
        }
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }
}


