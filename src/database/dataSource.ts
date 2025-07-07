import { DataSource } from "typeorm";
import { config } from './../../config';
import { User } from '../entities/user';

export const AppDataSource = new DataSource({
    type:"postgres",
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUsername,
    password: config.dbPassword,
    database: config.dbName,
    schema: config.dbSchema,
    synchronize: config.dbSync,
    logging: true,
    entities: [User],
})