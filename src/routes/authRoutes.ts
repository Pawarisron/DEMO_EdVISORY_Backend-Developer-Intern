import { FastifyInstance } from 'fastify';
import { login, logout, logoutAll } from '../controllers/authController';

const authRoute = async(fastify:FastifyInstance) =>{
    fastify.post("/login", login);
    fastify.post("/logout", logout);
    fastify.post("/logout-all", logoutAll);

}
export default authRoute;