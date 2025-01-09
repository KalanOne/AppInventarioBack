import { Injectable } from '@nestjs/common';
import { FilterProductDto } from './dto/productList.dto';
import { Product } from 'src/entities/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly dataSource: DataSource,
  ) {}

  async getProducts(query: FilterProductDto) {
    const {
      limit,
      skip,
      search,
      barcode,
      description,
      factor,
      multiple,
      name,
      serialNumber,
      id,
      almacen,
    } = query;

    return this.productRepository.findAndCount({
      take: limit,
      skip: skip,
      where: [
        {
          articles: {
            barcode: barcode ? Like(`%${barcode}%`) : undefined,
            factor,
            almacen: almacen ? Like(`%${almacen}%`) : undefined,
            multiple: multiple ? Like(`%${multiple}%`) : undefined,
            transactionDetails: {
              serialNumber: serialNumber
                ? Like(`%${serialNumber}%`)
                : undefined,
            },
          },
          name: name ? Like(`%${name}%`) : undefined,
          description: description ? Like(`%${description}%`) : undefined,
        },
        { name: search ? Like(`%${search}%`) : undefined },
        {
          articles: { barcode: search ? Like(`%${search}%`) : undefined },
        },
        {
          articles: { multiple: search ? Like(`%${search}%`) : undefined },
        },
        {
          articles: { almacen: search ? Like(`%${search}%`) : undefined },
        },
        {
          articles: {
            transactionDetails: {
              serialNumber: search ? Like(`%${search}%`) : undefined,
            },
          },
        },
        { id: id ?? undefined },
      ],
      order: { name: 'ASC' },
    });
  }

  async getInventory(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const result: {
        total: number;
        totalAvailable: number;
        totalOutsideCountingInventory: number;
      } = await manager
        .createQueryBuilder(Product, 'p')
        .select(
          `COALESCE(
              SUM(CASE
                  WHEN t.transaction_type = 'ENTRY' AND td.afectation = TRUE THEN td.quantity * a.factor
                  WHEN t.transaction_type = 'ENTRY' AND td.afectation = FALSE THEN 0
                  WHEN t.transaction_type = 'EXIT' AND td.afectation = FALSE THEN 0
                  WHEN t.transaction_type = 'EXIT' AND td.afectation = TRUE THEN -td.quantity * a.factor
                  ELSE 0
              END), 0
            ) AS "total"`,
        )
        .addSelect(
          `COALESCE(
              SUM(CASE
                  WHEN t.transaction_type = 'ENTRY' THEN td.quantity * a.factor
                  WHEN t.transaction_type = 'EXIT' THEN -td.quantity * a.factor
                  ELSE 0
              END), 0
            ) AS "totalAvailable"`,
        )
        .addSelect(
          `COALESCE(
              SUM(CASE
                  WHEN t.transaction_type = 'ENTRY' AND td.afectation = FALSE THEN -td.quantity * a.factor
                  WHEN t.transaction_type = 'EXIT' AND td.afectation = FALSE THEN td.quantity * a.factor
                  ELSE 0
              END), 0
            ) AS "totalOutsideCountingInventory"`,
        )
        .innerJoin('p.articles', 'a')
        .innerJoin('a.transactionDetails', 'td')
        .innerJoin('td.transaction', 't')
        .where('p.id = :id', { id: id })
        .getRawOne();

      const product = await manager.getRepository(Product).findOne({
        where: { id },
      });
      const articles = await manager.getRepository(Article).find({
        where: { product: { id } },
      });
      const transactions = await manager.getRepository(Transaction).find({
        where: { transactionDetails: { article: { product: { id } } } },
        order: { createdAt: 'DESC' },
      });
      return {
        ...result,
        product,
        articles,
        transactions,
      };
    });
  }
}
