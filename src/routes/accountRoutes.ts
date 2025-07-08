import { FastifyInstance } from 'fastify';
import { createAccountByUserId, deleteAccountById, getAllAccountByUserId } from '../controllers/accountController';

const accountRoutes = async(fastify:FastifyInstance) =>{
    fastify.get("/accounts", getAllAccountByUserId)
    fastify.post("/accounts", createAccountByUserId)
    fastify.delete("/accounts/:id", deleteAccountById)
}
export default accountRoutes;