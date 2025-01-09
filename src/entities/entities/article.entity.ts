import {
  BeforeInsert,
  BeforeUpdate,
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

  @ManyToOne(() => Product, (product) => product.articles, {
    eager: true,
    cascade: true,
  })
  product: Product;

  @Column({ unique: true })
  barcode: string;

  @Column()
  multiple: string;

  @Column()
  factor: number;

  @Column({ nullable: true })
  almacen?: string;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.article,
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

  @BeforeInsert()
  @BeforeUpdate()
  unify() {
    this.multiple = this.multiple.toUpperCase();
    this.almacen = this.almacen?.toUpperCase();
  }
}
