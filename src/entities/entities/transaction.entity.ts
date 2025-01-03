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
import { User } from './user.entity';
import { TransactionDetail } from './transactionDetail.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: ['ENTRY', 'EXIT'] })
  transaction_type: 'ENTRY' | 'EXIT';

  @Column()
  transaction_date: Date;

  @ManyToOne(() => User, (user) => user.transactions, { eager: true })
  user: User;

  @Column({ unique: true })
  folio_number: string;

  @Column()
  person_name: string;

  @OneToMany(
    () => TransactionDetail,
    (transactionDetail) => transactionDetail.transaction,
    { eager: true, cascade: true },
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
    this.person_name = this.person_name.toUpperCase();
  }
}
