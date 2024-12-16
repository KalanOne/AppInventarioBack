import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { TransactionDetail } from './transactionDetail.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  serialNumber?: string;

  @ManyToOne(() => Article, (article) => article.units)
  article: Article;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.unit,
  )
  transactionDetails: TransactionDetail[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedDate: Date;
}
