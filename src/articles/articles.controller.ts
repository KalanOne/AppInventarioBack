import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { FilterArticleDto } from './dto/filter-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findAll(@Query() query: FilterArticleDto) {
    return this.articlesService.findAll(query);
  }

  @Patch()
  update(@Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(updateArticleDto);
  }

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }
}
