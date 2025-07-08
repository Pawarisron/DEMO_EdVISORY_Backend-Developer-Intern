import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Account } from "./Account";
import { Category } from "./Category";
import { Transaction } from "./Transaction";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    username!: string;

    @Column({ name: "password_hash", type: "text" })
    passwordHash!: string;

    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[] | undefined;

    @OneToMany(() => Category, (category) => category.user)
    categories: Category[] | undefined;

    @OneToMany(() => Transaction, (transaction) => transaction.user)
    transactions: Transaction[] | undefined;
    
}
