import { FastifyReply } from "fastify";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import { Category } from "../entities/Category";
import { User } from "../entities/User";
import { AppDataSource } from "../database/dataSource";
import { createCategoryByUserIdSchema } from "../schemas/categories/createCategoryByUserIdSchema";
import { config } from "../../config";
import { paginationSchema } from "../schemas/paginationSchema";
import { deleteCategoryByIdSchema } from "../schemas/categories/deleteCategoryByIdSchema";


//Get all categories
export const getAllCategoriesByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
        const {error, value} = paginationSchema.validate(req.query || null)
        if(error){
            return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
        }
        const userId = req.user?.id;
        if(!userId){
            return reply.code(401).send({ message: 'Unauthorized'});
        }
        //Repo
        const categoryRepo = AppDataSource.getRepository(Category);
        const userRepo = AppDataSource.getRepository(User);
        //Find User
        const user = await userRepo.findOneBy({ id: userId });
            if (!user) {
            return reply.code(400).send({ message: 'User not found'});
        }
        //get query
        const page = value.page || 1;
        const size = value.size || config.allowedPageSize[0];
        //check page size
        const pageSize = config.allowedPageSize.includes(size) ? size : config.allowedPageSize[0];
        const [categories, total] = await categoryRepo.findAndCount({
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
        data: categories,
        pagination: {
            total,
            page,
            size: pageSize,
            totalPages: Math.ceil(total / pageSize),
            },
        });

    }catch(error){
        req.log.error(error);
        reply.code(500).send({ message: 'Internal Server Error', details: error });
    }
}

//Create Category
export const createCategoryByUserId = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
            //validation
            const {error, value} = createCategoryByUserIdSchema.validate(req.body || null);
            if(error){
                return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
            }
            const userId = req.user?.id;
            if(!userId){
                return reply.code(401).send({ message: 'Unauthorized'});
            }
            //Repo
            const categoryRepo = AppDataSource.getRepository(Category);
            const userRepo = AppDataSource.getRepository(User);
            //Find User
            const user = await userRepo.findOneBy({ id: userId });
             if (!user) {
                return reply.code(400).send({ message: 'User not found'});
            }
            //create category
            const category = new Category();
            category.name = value.name;
            category.type = value.type;
            category.user = user;
    
            //save in db
            await categoryRepo.save(category);
            return reply.status(201).send({message: "category created",category:category})
    
        }
        catch(error){
            req.log.error(error);
            console.error(error); //testing
            reply.code(500).send({ message: 'Internal Server Error', details: error });
        }
}

//Delete Category by category id
export const deleteCategoryById = async (req:UserPrincipleRequest, reply:FastifyReply) =>{
    try{
            const {error, value} = deleteCategoryByIdSchema.validate(req.params || null);
            if(error){
                return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
            }
            const userId = req.user?.id;
            if(!userId){
                return reply.code(401).send({ message: 'Unauthorized'});
            }
            //Repo
            const categoryRepo = AppDataSource.getRepository(Category);
            //Find category that belong to this userId
            const categoryId = value.id
            const category = await categoryRepo.findOne({ 
                where: 
                { 
                    id:categoryId, 
                    user: 
                    { id: userId } 
                } 
            });
            if (!category) {
                return reply.status(403).send({ message: 'Unauthorized or not found' });
            }
            //delete category
            await categoryRepo.remove(category);
            return reply.status(200).send({ message: 'Category deleted successfully' ,id:categoryId });
        }
        catch(error){
            req.log.error(error);
            reply.code(500).send({ message: 'Internal Server Error', details: error });
        }

}
