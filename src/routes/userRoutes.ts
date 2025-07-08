import { FastifyInstance } from "fastify";
import { getUsers} from "../controllers/userController";

const userRoutes = async (fastify : FastifyInstance) => {
    fastify.get("/users", getUsers)
}

export default userRoutes