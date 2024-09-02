import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Article } from './entities/article.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionDetail } from './entities/transactionDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Article,
      Transaction,
      TransactionDetail,
    ]),
  ],
})
export class EntitiesModule {}