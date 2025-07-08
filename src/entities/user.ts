import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string = '';

    @Column({ unique: true })
    username: string = '';

    @Column({ name: "password_hash", type: "text" })
    passwordHash: string = '';
}
