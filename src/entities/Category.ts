import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";


export type CategoryType = 'INCOME' | 'EXPENSE';

@Entity({ name: 'categories' })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string | undefined;

  @Column({ type: 'uuid' })
  user_id: string | undefined;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | undefined;

  @Column({ type: 'varchar' })
  name: string | undefined;

  @Column({ type: 'varchar'})
  type: CategoryType | undefined;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date | undefined;
}