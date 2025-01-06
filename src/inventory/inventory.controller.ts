import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { FilterProductDto } from './dto/productList.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('products')
  async getProducts(@Query() filterProductDto: FilterProductDto) {
    return await this.inventoryService.getProducts(filterProductDto);
  }

  @Get('product/:id')
  async getInventory(@Param('id') id: number) {
    return await this.inventoryService.getInventory(id);
  }
}
