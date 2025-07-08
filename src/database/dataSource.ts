import { DataSource } from "typeorm";
import { config } from './../../config';
import { Account } from "../entities/Account";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { Transaction } from "../entities/Transaction";

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
    entities: [User, Account, Category , Transaction],
})