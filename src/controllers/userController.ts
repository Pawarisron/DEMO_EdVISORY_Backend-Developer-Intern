import { FastifyReply, FastifyRequest } from "fastify";
import { AppDataSource } from "../database/dataSource";
import { User } from "../entities/user";

//Get all users
export const getUsers = async(req:FastifyRequest, reply:FastifyReply) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const users = await userRepo.find();
        reply.send(users);
  } catch (error) {
    req.log.error(error);
    reply.code(500).send({ message: 'Internal Server Error' });
  }
}

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