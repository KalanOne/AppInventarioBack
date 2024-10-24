import { Controller, Get } from '@nestjs/common';
import { SearchsService } from './searchs.service';

@Controller('searchs')
export class SearchsController {
  constructor(private readonly searchsService: SearchsService) {}

  @Get('products')
  async searchProducts() {
    return await this.searchsService.searchProducts();
  }
}
