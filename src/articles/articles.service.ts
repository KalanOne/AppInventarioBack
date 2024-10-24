import { Injectable } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { Article } from 'src/entities/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterArticleDto } from './dto/filter-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Product } from 'src/entities/entities/product.entity';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
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
    } = query;

    return await this.articlesRepository.findAndCount({
      take: limit,
      skip: skip,
      where: [
        {
          barcode: barcode ? Like(`%${barcode}%`) : undefined,
          factor,
          multiple: multiple ? Like(`%${multiple}%`) : undefined,
          product: {
            name: name ? Like(`%${name}%`) : undefined,
            description: description ? Like(`%${description}%`) : undefined,
          },
          units: {
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
          units: {
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
    product.name = data.name;
    product.description = data.description;
    article.barcode = data.barcode;
    article.factor = data.factor;
    article.multiple = data.multiple;
    return this.dataSource.transaction(async (manager) => {
      return {
        product: await manager.save(product),
        article: await manager.save(article),
      };
    });
  }

  async create(createArticleDto: CreateArticleDto) {
    return this.dataSource.transaction(async (manager) => {
      const product = new Product();
      if (createArticleDto.productId) {
        product.id = createArticleDto.productId;
      }
      product.name = createArticleDto.name;
      product.description = createArticleDto.description;
      const savedProduct = await manager.save(product);
      const article = new Article();
      article.barcode = createArticleDto.barcode;
      article.factor = createArticleDto.factor;
      article.multiple = createArticleDto.multiple;
      article.product = savedProduct;
      return await manager.save(article);
    });
  }
}
