import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Account } from "./Account";
import { Category } from "./Category";

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id: string | undefined;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | undefined;

  @Column({ type: 'uuid', nullable: true })
  account_id: string | undefined ;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: Account | undefined;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | undefined;

  @ManyToOne(() => Category, (category) => category.transactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | undefined;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: number ;

  @Column({ type: 'date' })
  transaction_date!: string;

  @Column({ type: 'text', nullable: true })
  note_cleaned: string | undefined;

  @Column({ type: 'text', nullable: true })
  slip_path: string | undefined;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date | undefined;
}