import { FastifyInstance } from "fastify";
import { createTransactionByUserId, getAllTransactionByUserId, getTransactionById } from "../controllers/transactionController";

const transactionRoues = async(fastify:FastifyInstance) =>{
    fastify.get("/transactions", getAllTransactionByUserId);
    fastify.get("/transactions/:id", getTransactionById);
    fastify.post("/transactions", createTransactionByUserId);
}
export default transactionRoues;