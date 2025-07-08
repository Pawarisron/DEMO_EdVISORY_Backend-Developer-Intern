import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Account } from "./Account";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string = '';

    @Column({ unique: true })
    username: string = '';

    @Column({ name: "password_hash", type: "text" })
    passwordHash: string = '';

    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[] | undefined;
}
