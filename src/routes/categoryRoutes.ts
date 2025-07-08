import { FastifyInstance } from "fastify";
import { createCategoryByUserId, deleteCategoryById, getAllCategoriesByUserId } from "../controllers/categoryController";

const categoryRoutes = async(fastify:FastifyInstance) =>{
    fastify.get("/categories", getAllCategoriesByUserId);
    fastify.post("/categories", createCategoryByUserId);
    fastify.delete("/categories/:id", deleteCategoryById);
}
export default categoryRoutes;