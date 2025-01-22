import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/entities/product.entity';
import { In, Repository } from 'typeorm';
import { SearchArticleDto } from './dto/search-article.dto';
import { Article } from 'src/entities/entities/article.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { Warehouse } from 'src/entities/entities/warehouse.entity';
import { User } from 'src/entities/entities/user.entity';

@Injectable()
export class SearchsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async searchProducts() {
    return this.productsRepository.find();
  }

  async searchArticles(query: SearchArticleDto) {
    const { id, barcode, multiple, factor, product_id } = query;
    return this.articlesRepository.find({
      where: [
        { id },
        { barcode },
        { multiple, factor },
        {
          product: {
            id:
              product_id && product_id.length > 0 ? In(product_id) : undefined,
          },
        },
      ],
    });
  }

  // async getTransactionsList() {
  //   return this.transactionRepository.find({
  //     order: { createdAt: 'DESC' },
  //     loadEagerRelations: false,
  //     relations: ['user'],
  //   });
  // }

  async getTransactionsList() {
    const transactions = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.transactionDetails', 'transactionDetail')
      .leftJoinAndSelect('transactionDetail.article', 'article')
      .select([
        'transaction.id',
        'transaction.createdAt',
        'transaction.deletedDate',
        'transaction.folio_number',
        'transaction.transaction_date',
        'transaction.transaction_type',
        'transaction.updatedAt',
        'transaction.version',
        'transaction.person_name',
        'user.id',
        'user.createdAt',
        'user.deletedDate',
        'user.email',
        'user.first_name',
        'user.last_name',
        'user.updatedAt',
        'user.version',
      ])
      .addSelect(
        `ARRAY_AGG(DISTINCT transactionDetail.serialNumber) FILTER (WHERE transactionDetail.serialNumber IS NOT NULL AND transactionDetail.serialNumber != '') as serials`,
      )
      .addSelect(
        `ARRAY_AGG(DISTINCT article.barcode) FILTER (WHERE article.barcode IS NOT NULL AND article.barcode != '') as barcodes`,
      )
      .groupBy(
        'transaction.id, transaction.createdAt, transaction.deletedDate, transaction.folio_number, transaction.transaction_date, transaction.transaction_type, transaction.updatedAt, transaction.version, user.id, user.createdAt, user.deletedDate, user.email, user.first_name, user.last_name, user.updatedAt, user.version',
      )
      .orderBy('transaction.createdAt', 'DESC')
      .getRawMany();

    return transactions.map((tx) => ({
      id: tx.transaction_id,
      createdAt: tx.transaction_createdAt,
      deletedDate: tx.transaction_deletedDate,
      folio_number: tx.transaction_folio_number,
      transaction_date: tx.transaction_transaction_date,
      transaction_type: tx.transaction_transaction_type,
      updatedAt: tx.transaction_updatedAt,
      version: tx.transaction_version,
      person_name: tx.transaction_person_name,
      user: {
        id: tx.user_id,
        createdAt: tx.user_createdAt,
        deletedDate: tx.user_deletedDate,
        email: tx.user_email,
        first_name: tx.user_first_name,
        last_name: tx.user_last_name,
        updatedAt: tx.user_updatedAt,
        version: tx.user_version,
      },
      codes: [...(tx.serials ?? []), ...(tx.barcodes ?? [])],
    }));
  }

  async searchWarehouses() {
    return this.warehousesRepository.find();
  }

  async searchUsers() {
    return this.usersRepository.find();
  }
}
