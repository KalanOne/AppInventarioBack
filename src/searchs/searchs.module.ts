import { Article } from 'src/entities/entities/article.entity';
import { Product } from 'src/entities/entities/product.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { User } from 'src/entities/entities/user.entity';
import { Warehouse } from 'src/entities/entities/warehouse.entity';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SearchsController } from './searchs.controller';
import { SearchsService } from './searchs.service';

@Module({
  controllers: [SearchsController],
  providers: [SearchsService],
  imports: [
    TypeOrmModule.forFeature([Transaction, Article, Product, Warehouse, User]),
  ],
})
export class SearchsModule {}
