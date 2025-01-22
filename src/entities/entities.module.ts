import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Article } from './entities/article.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionDetail } from './entities/transactionDetail.entity';
import { Role } from './entities/role.entity';
import { Warehouse } from './entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      Warehouse,
      Article,
      Transaction,
      TransactionDetail,
      Role,
    ]),
  ],
})
export class EntitiesModule {}
