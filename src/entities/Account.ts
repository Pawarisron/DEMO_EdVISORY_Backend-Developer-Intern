import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({ name: 'accounts' })
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'uuid' })
  user_id: string | undefined;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | undefined;

  @Column({ type: 'varchar' })
  name: string | undefined;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date | undefined;
}