import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionDetail } from 'src/entities/entities/transactionDetail.entity';
import { Product } from 'src/entities/entities/product.entity';
import { Article } from 'src/entities/entities/article.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { Warehouse } from 'src/entities/entities/warehouse.entity';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
  imports: [
    TypeOrmModule.forFeature([
      Transaction,
      TransactionDetail,
      Warehouse,
      Article,
      Product,
    ]),
  ],
})
export class TransactionsModule {}
