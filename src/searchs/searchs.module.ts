import { Module } from '@nestjs/common';
import { SearchsService } from './searchs.service';
import { SearchsController } from './searchs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { Product } from 'src/entities/entities/product.entity';

@Module({
  controllers: [SearchsController],
  providers: [SearchsService],
  imports: [TypeOrmModule.forFeature([Article, Product])],
})
export class SearchsModule {}
