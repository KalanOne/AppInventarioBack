import { Controller, Get, Query } from '@nestjs/common';
import { SearchsService } from './searchs.service';
import { SearchArticleDto } from './dto/search-article.dto';

@Controller('searchs')
export class SearchsController {
  constructor(private readonly searchsService: SearchsService) {}

  @Get('products')
  async searchProducts() {
    return await this.searchsService.searchProducts();
  }

  @Get('articles')
  async searchArticles(@Query() query: SearchArticleDto) {
    return await this.searchsService.searchArticles(query);
  }
}
