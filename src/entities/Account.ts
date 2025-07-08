import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Transaction } from "./Transaction";

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id: string | undefined;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | undefined;

  @Column({ type: 'varchar' })
  name!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date | undefined;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Transaction[] | undefined;
}