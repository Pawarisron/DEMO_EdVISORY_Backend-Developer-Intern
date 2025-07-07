import { FastifyReply, FastifyRequest } from "fastify";
import { AppDataSource } from "../database/dataSource";
import { User } from "../entities/user";
import { UserPrincipleRequest } from "../types/UserPrincipleRequest";
import Joi from "joi";

// Get all users
// export const getUsers = async(req:FastifyRequest, reply:FastifyReply) => {
//   try {
//     const userRepo = AppDataSource.getRepository(User);
//     const users = await userRepo.find();
//     reply.send(users);


//   } catch (error) {
//     req.log.error(error);
//     reply.code(500).send({ message: 'Internal Server Error' });
//   }
// }

const ALLOWED_PAGE_LIMITS = [10, 20, 50, 100];
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().valid(...ALLOWED_PAGE_LIMITS).default(10),
});

export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {

    //validation
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return reply.code(400).send({ message: 'Invalid query parameters', details: error.details });
    }

    //get query
    const page = parseInt((req.query as any).page) || 1;
    const size = parseInt((req.query as any).size) || 10;
    
    const userRepo = AppDataSource.getRepository(User);
    const pageSize = ALLOWED_PAGE_LIMITS.includes(size) ? size : 10;

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
    reply.code(500).send({ message: 'Internal Server Error' });
  }
}