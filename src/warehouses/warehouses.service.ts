import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Warehouse } from 'src/entities/entities/warehouse.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseRepository.save(createWarehouseDto);
  }

  async findAll() {
    return this.warehouseRepository.findAndCount({
      relations: ['articles'],
    });
  }

  async findOne(id: number) {
    return this.warehouseRepository.findOne({ where: { id } });
  }

  async update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseRepository.update(id, updateWarehouseDto);
  }

  async remove(id: number) {
    return this.warehouseRepository.delete(id);
  }
}
