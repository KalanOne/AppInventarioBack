import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  async create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return await this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  async findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(+id, updateWarehouseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.warehousesService.remove(+id);
  }
}
