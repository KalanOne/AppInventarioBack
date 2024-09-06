import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArticleDto } from './dto/filter-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
  ) {}

  async findAll(query: FilterArticleDto) {
    console.log(query);
    return await this.articlesRepository.findAndCount({
      take: query.limit,
      skip: query.skip,
      order: { product: { name: 'ASC' } },
      relations: { product: true },
    });
  }
}
