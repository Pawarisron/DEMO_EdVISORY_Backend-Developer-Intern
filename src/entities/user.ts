import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from "typeorm";

@Entity({ name: 'users' })
export class User {
    @PrimaryColumn({ type: 'varchar', length: 255 })
    id!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    username!: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    password_hash!: string;

    @Column({ type: 'boolean', default: false })
    deleted!: boolean;

    @Column({ type: 'varchar', length: 255, default: 'USER' })
    role!: string;
}
