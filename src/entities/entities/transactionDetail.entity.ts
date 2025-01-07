import {
  BeforeInsert,
  BeforeUpdate,
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
import { HttpException, HttpStatus } from '@nestjs/common';
import { Article } from './article.entity';

@Entity()
export class TransactionDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, (transaction) => transaction.transactionDetails)
  transaction: Transaction;

  @ManyToOne(() => Article, (article) => article.transactionDetails, {
    eager: true,
    cascade: true,
  })
  article: Article;

  @Column({ nullable: true })
  serialNumber?: string;

  @Column({
    comment: 'Afecta o no inventario de acuerdo a salida o entrada',
  })
  afectation: boolean;

  @Column({
    default: 1,
    comment:
      'Quantity of the unit, if the unit has a serial number, the quantity will be 1 forcely, if the unit does not have a serial number, the quantity can be greater than 1',
  })
  quantity: number;

  @Column({ nullable: true })
  price?: number;

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
    this.price = Number(this.price ? this.price.toFixed(2): 0);
    if (this.serialNumber && this.quantity !== 1) {
      throw new HttpException(
        'The unit has a serial number, quantity must be 1',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (this.quantity < 1) {
      throw new HttpException(
        'Quantity must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
