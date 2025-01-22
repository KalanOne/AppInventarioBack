import { Injectable } from '@nestjs/common';
import { DataSource, Int32, Like, Repository } from 'typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArticleDto } from './dto/filter-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Product } from 'src/entities/entities/product.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { Warehouse } from 'src/entities/entities/warehouse.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Warehouse)
    private readonly warehousesRepository: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(query: FilterArticleDto) {
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
      warehouse,
    } = query;

    return await this.articlesRepository.findAndCount({
      take: limit,
      skip: skip,
      where: [
        {
          barcode: barcode ? Like(`%${barcode}%`) : undefined,
          factor,
          multiple: multiple ? Like(`%${multiple}%`) : undefined,
          warehouse: warehouse ? { id: warehouse } : undefined,
          product: {
            name: name ? Like(`%${name}%`) : undefined,
            description: description ? Like(`%${description}%`) : undefined,
          },
          transactionDetails: {
            serialNumber: serialNumber ? Like(`%${serialNumber}%`) : undefined,
          },
        },
        {
          product: {
            name: search ? Like(`%${search}%`) : undefined,
          },
        },
        {
          barcode: search ? Like(`%${search}%`) : undefined,
        },
        {
          multiple: search ? Like(`%${search}%`) : undefined,
        },
        {
          warehouse: search ? { name: Like(`%${search}%`) } : undefined,
        },
        {
          factor: !isNaN(Number(search))
            ? Number(search) < 2147483647
              ? Number(search)
              : undefined
            : undefined,
        },
        {
          transactionDetails: {
            serialNumber: search ? Like(`%${search}%`) : undefined,
          },
        },
      ],
      order: { product: { name: 'ASC' } },
      relations: { product: true },
    });
  }

  async update(updateArticleDto: UpdateArticleDto) {
    const { articleId, productId, ...data } = updateArticleDto;
    const product = await this.productsRepository.findOneOrFail({
      where: { id: productId },
    });
    const article = await this.articlesRepository.findOneOrFail({
      where: { id: articleId },
    });
    const warehouse = await this.warehousesRepository.findOneOrFail({
      where: { id: data.warehouse },
    });
    product.name = data.name;
    product.description = data.description;
    article.product = product;
    article.barcode = data.barcode;
    article.factor = data.factor;
    article.multiple = data.multiple;
    article.warehouse = warehouse;
    return this.dataSource.transaction(async (manager) => {
      const response = await manager.save(article);
      return {
        product: response.product,
        article: response,
      };
    });
  }

  async create(createArticleDto: CreateArticleDto) {
    return this.dataSource.transaction(async (manager) => {
      const warehouse = await manager.findOneOrFail(Warehouse, {
        where: { id: createArticleDto.warehouse },
      });
      const product = new Product();
      if (createArticleDto.productId) {
        product.id = createArticleDto.productId;
      }
      product.name = createArticleDto.name;
      product.description = createArticleDto.description;
      // const savedProduct = await manager.save(product);
      const article = new Article();
      article.barcode = createArticleDto.barcode;
      article.factor = createArticleDto.factor;
      article.multiple = createArticleDto.multiple;
      article.warehouse = warehouse;
      article.product = product;
      return await manager.save(article);
    });
  }
}
