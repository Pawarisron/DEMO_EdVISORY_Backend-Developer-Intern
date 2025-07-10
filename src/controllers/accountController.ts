import { FastifyReply} from "fastify";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import { AppDataSource } from "../database/dataSource";
import { Account } from "../entities/Account";
import { User } from "../entities/User";
import { paginationSchema } from "../schemas/paginationSchema";
import { config } from "../config/config";
import { createAccountByUserIdSchema } from "../schemas/accounts/createAccountByUserIdSchema";
import { deleteAccountByIdSchema } from "../schemas/accounts/deleteAccountByIdSchema";


//Get all account by user id
export const getAllAccountByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        const {error, value} = paginationSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
        }
        //Repo
        const accountRepo = AppDataSource.getRepository(Account);
        const userRepo = AppDataSource.getRepository(User);
        //Find User
        const user = await userRepo.findOneBy({ id: userId });
         if (!user) {
            return reply.code(400).send({ message: req.i18n.t("user_not_found")});
        }
        //get query
        const page = value.page || 1;
        const size = value.size || config.allowedPageSize[0];
        //check page size
        const pageSize = config.allowedPageSize.includes(size) ? size : config.allowedPageSize[0];
        const [accounts, total] = await accountRepo.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where:{
                user_id:userId
            },
            order: {
                name: 'ASC',
            },
        });
        //Reply
        reply.send({
        data: accounts,
        pagination: {
            total,
            page,
            size: pageSize,
            totalPages: Math.ceil(total / pageSize),
            },
        });

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }

}


//Create account
export const createAccountByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        //validation
        const {error, value} = createAccountByUserIdSchema.validate(req.body || null);
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
        }
        //Repo
        const accountRepo = AppDataSource.getRepository(Account);
        const userRepo = AppDataSource.getRepository(User);
        //Find User
        const user = await userRepo.findOneBy({ id: userId });
         if (!user) {
            return reply.code(400).send({ message: req.i18n.t("user_not_found")});
        }
        //create account
        const account = new Account();
        account.name = value.name;
        account.user = user;

        //save in db
        await accountRepo.save(account);
        return reply.status(201).send({message: req.i18n.t("account_created"),account:account})

    }
    catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }
    
}

//Delete account by account id
export const deleteAccountById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        const {error, value} = deleteAccountByIdSchema.validate(req.params || null);
        if(error){
            return reply.code(400).send({ message: req.i18n.t('err_invalid_query_params'), details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: req.i18n.t('err_unauthorized')});
        }
        //Repo
        const accountRepo = AppDataSource.getRepository(Account);
        //Find account that belong to this userId
        const accountId = value.id
        const account = await accountRepo.findOne({ 
            where: 
            { 
                id:accountId, 
                user: 
                { id: userId } 
            } 
        });
        if (!account) {
            return reply.status(403).send({ message: req.i18n.t("err_unauthorized_or_not_found") });
        }
        //delete account
        await accountRepo.remove(account);
        return reply.status(200).send({ message:  req.i18n.t("account_deleted_successfully") ,id:accountId });
    }
    catch(error){
        req.log.error(error);
        reply.code(500).send({ message: req.i18n.t("err_internal_server_error"), details: error });
    }
}
