import { FastifyInstance } from "fastify";
import { getItems, getItemById } from "../controllers/itemController";

const itemRoutes = async (fastify: FastifyInstance) => {
  fastify.get("/items", getItems)
  fastify.get("/items/:id", getItemById)
};

export default itemRoutes;
