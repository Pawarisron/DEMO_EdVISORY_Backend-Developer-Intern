import Fastify from "fastify"
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { config } from "../config";
import { AppDataSource } from "./database/dataSource";
import auth from "./middlewares/auth"

const fastify = Fastify({logger: false})

//register plugin
fastify.register(swagger)
fastify.register(swaggerUI, {
    routePrefix: config.swaggerPath,
    uiConfig: {
        docExpansion: 'list',
    },
    staticCSP: true,
});

//register middlewares
fastify.addHook("preHandler", auth) //authentication

//register route
fastify.register(require("./routes/authRoutes"))
fastify.register(require("./routes/userRoutes")) //test
fastify.register(require("./routes/accountRoutes"))
fastify.register(require("./routes/categoryRoutes"))

const start = async () => {
    try {
        await AppDataSource.initialize();
        await fastify.listen({port: config.port})
        console.log(`Server listening on port ${config.port}`);
    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

start()
