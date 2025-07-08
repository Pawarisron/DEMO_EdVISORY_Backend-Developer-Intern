import { FastifyInstance } from "fastify";
import { createTransactionByUserId, getAllTransactionByUserId, getTransactionById, uploadTransactionSlipById } from "../controllers/transactionController";

const transactionRoues = async(fastify:FastifyInstance) =>{
    fastify.get("/transactions", getAllTransactionByUserId);
    fastify.get("/transactions/:id", getTransactionById);
    fastify.post("/transactions", createTransactionByUserId);
    fastify.post("/transactions/:id/slip", uploadTransactionSlipById);
}
export default transactionRoues;