import dotenv from "dotenv"
dotenv.config()

export const config = {
    port: parseInt(process.env.PORT || "3000"),
    swaggerPath: (process.env.SWAGGER_PATH || "swagger"),
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT || "5432"),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbSchema: process.env.DB_SCHEMA,
}

