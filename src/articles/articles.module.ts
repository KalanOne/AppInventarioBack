import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { Article } from 'src/entities/entities/article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService],
  imports: [TypeOrmModule.forFeature([Article])],
})
export class ArticlesModule {}
