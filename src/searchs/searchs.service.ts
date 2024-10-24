import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SearchsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async searchProducts() {
    return await this.productsRepository.find();
  }
}
