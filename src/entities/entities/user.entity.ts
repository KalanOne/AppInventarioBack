import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Role } from './role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  roles: Role[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedDate: Date;

  @BeforeInsert()
  @BeforeUpdate()
  unify() {
    this.email = this.email.toLowerCase();
    this.first_name = this.first_name.toUpperCase();
    this.last_name = this.last_name.toUpperCase();
  }
}
