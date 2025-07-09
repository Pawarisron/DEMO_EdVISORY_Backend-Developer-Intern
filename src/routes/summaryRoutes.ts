import { FastifyInstance } from "fastify";
import { getSummaryAllowanceByUserId, getSummaryByUserId } from "../controllers/summaryController";


const summaryRoutes = async(fastify:FastifyInstance) =>{
    fastify.get("/summary", getSummaryByUserId);
    fastify.get("/summary/allowance", getSummaryAllowanceByUserId);
}
export default summaryRoutes;