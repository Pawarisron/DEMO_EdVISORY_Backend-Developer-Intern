import dotenv from "dotenv"
dotenv.config()

export const config = {
    //Server
    port: parseInt(process.env.PORT || "3000"),
    secret: process.env.SECRET || '',
    allowedPageSize: (process.env.ALLOWED_PAGE_SIZE || '10,20,50,100')
    .split(',')
    .map(Number)
    .filter(n => !isNaN(n)),

    //DB
    dbHost: process.env.DB_HOST || "localhost",
    dbPort: parseInt(process.env.DB_PORT || "5432"),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
    dbSchema: process.env.DB_SCHEMA,
    dbSync: process.env.DB_SYNC === "true" || false ,
    
    //Redis
    redisHost: process.env.REDIS_HOST,
    redisPort: parseInt(process.env.REDIS_PORT || "6379"),
    redisTimeToLive: parseInt(process.env.REDIS_TTL_SECONDS || "900"),

    //Swagger
    swaggerPath: (process.env.SWAGGER_PATH || "swagger"),
}

if(config.secret === ''){
    console.error(".env SECRET is empty");
    process.exit(1);
}

