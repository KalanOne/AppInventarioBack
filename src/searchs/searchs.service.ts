import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/entities/product.entity';
import { Repository } from 'typeorm';
import { SearchArticleDto } from './dto/search-article.dto';
import { Article } from 'src/entities/entities/article.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';

@Injectable()
export class SearchsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async searchProducts() {
    return this.productsRepository.find();
  }

  async searchArticles(query: SearchArticleDto) {
    const { id, barcode, multiple, factor } = query;
    return this.articlesRepository.find({
      where: [{ id }, { barcode }, { multiple, factor }, { ...query }],
    });
  }

  async getTransactionsList() {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
      loadEagerRelations: false,
      relations: ['user'],
    });
  }
}
