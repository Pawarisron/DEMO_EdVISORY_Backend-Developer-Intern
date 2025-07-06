import Fastify from "fastify"
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { config } from "../config";
import { AppDataSource } from "./database/dataSource";

const fastify = Fastify({logger: true})

//register plugin
fastify.register(swagger)
fastify.register(swaggerUI, {
    routePrefix: config.swaggerPath,
    uiConfig: {
        docExpansion: 'list',
    },
    staticCSP: true,
});
//register route
fastify.register(require("./routes/itemRoutes"))
fastify.register(require("./routes/userRoutes"))

const start = async () => {
    try {

        await AppDataSource.initialize();

        await fastify.listen({port: config.port})
        console.log(`Server listening on port ${config.port}`);
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

start()
