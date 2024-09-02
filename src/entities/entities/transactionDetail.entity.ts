import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';
import { Article } from './article.entity';

@Entity()
export class TransactionDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.transactionDetails)
  transaction: Transaction;

  @ManyToOne(() => Article, (article) => article.transactionDetails)
  article: Article;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn()
  deletedDate: Date;
}
