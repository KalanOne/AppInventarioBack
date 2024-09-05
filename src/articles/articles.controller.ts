import { Controller, Get, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticleDto } from './dto/filter-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: FilterArticleDto) {
    return this.articlesService.findAll(query);
  }
}
