import Fastify from "fastify"
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { config } from "../config";
import { AppDataSource } from "./database/dataSource";
import auth from "./middlewares/auth"
import i18n from 'fastify-i18n';
import path from "path";
import fs from 'fs'

const fastify = Fastify({logger: false})

//register plugin
fastify.register(multipart);
fastify.register(swagger)
fastify.register(swaggerUI, {
    routePrefix: config.swaggerPath,
    uiConfig: {
        docExpansion: 'list',
    },
    staticCSP: true,
});
type Messages = Record<string, Record<string, string>>
const loadMessages = (): Messages => {
    const localesDir = path.join(__dirname, 'locales')
    const languages = ['en', 'th']
    const messages: Messages = {}

    for (const lang of languages) {
        const filePath = path.join(localesDir, `${lang}.json`)
        const content = fs.readFileSync(filePath, 'utf-8')
        messages[lang] = JSON.parse(content)
    }
    return messages
}
fastify.register(i18n, {
  fallbackLocale: 'en',
  messages: loadMessages()
});


//register middlewares
fastify.addHook("preHandler", auth) //authentication

//register route
fastify.register(require("./routes/authRoutes"))
fastify.register(require("./routes/accountRoutes"))
fastify.register(require("./routes/categoryRoutes"))
fastify.register(require("./routes/transactionRoutes"))
fastify.register(require("./routes/summaryRoutes"))

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

