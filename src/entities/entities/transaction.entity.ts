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
import { User } from './user.entity';
import { TransactionDetail } from './transactionDetail.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  transaction_type: 'entry' | 'exit';

  @Column()
  transaction_date: Date;

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;

  @Column()
  supplier_name: string;

  @Column({ nullable: true })
  supplier_worker_number: string;

  @Column({ unique: true })
  folio_number: string;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.transaction,
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
