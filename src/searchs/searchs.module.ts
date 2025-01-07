import { Module } from '@nestjs/common';
import { SearchsService } from './searchs.service';
import { SearchsController } from './searchs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { Product } from 'src/entities/entities/product.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';
@Module({
  controllers: [SearchsController],
  providers: [SearchsService],
  imports: [TypeOrmModule.forFeature([Transaction, Article, Product])],
})
export class SearchsModule {}
