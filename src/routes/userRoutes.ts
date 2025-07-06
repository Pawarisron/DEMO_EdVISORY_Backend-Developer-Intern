import { FastifyInstance } from "fastify";
import { getUsers, getUsersActive } from "../controllers/userController";

const userRoutes = async (fastify : FastifyInstance) => {
    fastify.get("/users", getUsers)
    fastify.get("/users-active", getUsersActive)
}

export default userRoutes