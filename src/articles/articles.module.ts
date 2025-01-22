import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from 'src/entities/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/entities/product.entity';
import { Warehouse } from 'src/entities/entities/warehouse.entity';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [TypeOrmModule.forFeature([Article, Product, Warehouse])],
})
export class ArticlesModule {}
