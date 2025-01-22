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

  @Get('transactions/list')
  async getTransactions() {
    return await this.searchsService.getTransactionsList();
  }

  @Get("warehouses")
  async searchWarehouses() {
    return await this.searchsService.searchWarehouses();
  }

  @Get("users")
  async searchUsers() {
    return await this.searchsService.searchUsers();
  }
}
