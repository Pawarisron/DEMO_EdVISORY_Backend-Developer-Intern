import { FastifyReply, FastifyRequest } from "fastify";
import { AppDataSource } from "../database/dataSource";
import { User } from "../entities/user";
import Joi from "joi";
import { config } from "../../config";


const getUserSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  size: Joi.number().valid(...config.allowedPageSize).default(config.allowedPageSize[0]),
});
// Get all users
export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {

    //validation
    const { error } = getUserSchema.validate(req.query);
    if (error) {
      return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
    }
    //get query
    const page = parseInt((req.query as any).page) || 1;
    const size = parseInt((req.query as any).size) || config.allowedPageSize[0];
    
    //check page limit
    const pageSize = config.allowedPageSize.includes(size) ? size : config.allowedPageSize[0];
    const userRepo = AppDataSource.getRepository(User);

    const [users, total] = await userRepo.findAndCount({
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: {
        id: 'ASC',
      },
    });
    reply.send({
      data: users,
      pagination: {
        total,
        page,
        size: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    req.log.error(error);
    reply.code(500).send({ message: 'Internal Server Error', details: error });
  }
};


//Get all active users
export const getUsersActive = async(req:FastifyRequest, reply:FastifyReply) => {
  try {
      const userRepo = AppDataSource.getRepository(User);
      const users = await userRepo.find({
        where: { deleted: false },
        select: ['id', 'username', 'role'],
      });
      reply.send(users);
  } catch (error) {
    req.log.error(error);
    reply.code(500).send({ message: 'Internal Server Error', details: error });
  }
}