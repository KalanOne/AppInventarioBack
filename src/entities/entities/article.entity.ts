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
import { Product } from './product.entity';
import { TransactionDetail } from './transactionDetail.entity';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.articles)
  product: Product;

  @Column({ unique: true })
  barcode: string;

  @Column()
  multiple: string;

  @Column()
  factor: number;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.article,
  )
  transactionDetails: TransactionDetail[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;

  @DeleteDateColumn()
  deletedDate: Date;
}
