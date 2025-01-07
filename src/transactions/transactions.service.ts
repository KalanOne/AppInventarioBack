import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto, Unit } from './dto/create-transaction.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Product } from 'src/entities/entities/product.entity';
import { Article } from 'src/entities/entities/article.entity';
import { TransactionDetail } from 'src/entities/entities/transactionDetail.entity';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { ClsService } from 'nestjs-cls';
import { User } from 'src/entities/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto) {
    return this.dataSource.transaction(async (manager) => {
      const transactionDetails: TransactionDetail[] = [];
      const transaction = new Transaction();
      transaction.folio_number = createTransactionDto.folio;
      transaction.person_name = createTransactionDto.emitter;
      transaction.transaction_type = createTransactionDto.type;
      const user = this.cls.get<User>('user');
      transaction.user = user;
      transaction.transaction_date = createTransactionDto.transactionDate;

      const entry = createTransactionDto.type === 'ENTRY';

      for (const unit of createTransactionDto.units) {
        const newProduct = new Product();
        const newArticle = new Article();
        const transactionDetail = new TransactionDetail();

        if (unit.productId || unit.productId > 0) {
          newProduct.id = unit.productId;
        }
        newProduct.name = unit.name;
        newProduct.description = unit.description;
        // const productSaved = await manager.save(newProduct);

        if (unit.articleId || unit.articleId > 0) {
          newArticle.id = unit.articleId;
        }
        newArticle.barcode = unit.barcode;
        newArticle.multiple = unit.multiple;
        newArticle.factor = unit.factor;
        newArticle.product = newProduct;
        // const articleSaved = await manager.save(newArticle);

        if (unit.serial) {
          transactionDetail.serialNumber = unit.serial;
        }
        transactionDetail.afectation = unit.afectation;
        transactionDetail.article = newArticle;
        transactionDetail.quantity = unit.quantity;
        // transactionDetail.price = unit.price; // TODO: If you want to save the price, you must add it to the DTO and all the process
        // const unitSaved = await manager.save(transactionDetail);

        transactionDetails.push(transactionDetail);
        if (entry) {
          await this.validateEntry(unit, manager);
        } else {
          await this.validateExit(unit, manager);
        }
      }
      transaction.transactionDetails = transactionDetails;
      return manager.save(Transaction, transaction);
    });
  }

  private async validateEntry(unit: Unit, manager: EntityManager) {
    const transactionDetailsRepository =
      manager.getRepository(TransactionDetail);
    if (unit.serial) {
      const transactionsDetails = await transactionDetailsRepository.find({
        where: { serialNumber: unit.serial },
        relations: ['article', 'transaction'],
        order: { createdAt: 'DESC' },
      });
      if (transactionsDetails.length > 0) {
        const lastTransactionDetail = transactionsDetails[0];
        if (lastTransactionDetail.transaction.transaction_type === 'ENTRY') {
          throw new ConflictException(
            `The article ${unit.name} with serial number ${unit.serial} is already in the inventory`,
          );
        } else if (
          lastTransactionDetail.transaction.transaction_type === 'EXIT' &&
          lastTransactionDetail.afectation != unit.afectation
        ) {
          throw new ConflictException(
            `The article ${unit.name} with serial number ${unit.serial} is already in the inventory, but it is not available. Last transaction: ${lastTransactionDetail.transaction.folio_number}`,
          );
        }
      } else if (!unit.afectation) {
        throw new NotFoundException(
          `The article ${unit.name} with serial number ${unit.serial} is not in the inventory`,
        );
      }
    } else if (!unit.serial && !unit.afectation) {
      const transactionsDetails = await transactionDetailsRepository.find({
        where: {
          article: { barcode: unit.barcode },
          serialNumber: null,
        },
        relations: ['article', 'transaction'],
        order: { createdAt: 'DESC' },
      });
      if (transactionsDetails.length === 0) {
        if (!unit.afectation) {
          throw new ConflictException(
            `The article ${unit.name} - ${unit.barcode} has no prior exits to match this entry without affecting inventory.`,
          );
        }
      }
      if (
        transactionsDetails.filter(
          (item) =>
            !item.afectation && item.transaction.transaction_type == 'EXIT',
        ).length == 0
      ) {
        throw new ConflictException(
          `The article ${unit.name} ${unit.barcode} has not been exited before when it is not an afectation`,
        );
      } else {
        let productId = unit.productId;
        if (!unit.productId) {
          const article = await manager.findOne(Article, {
            where: { barcode: unit.barcode },
            relations: ['product'],
          });
          productId = article.product.id;
        }
        if (!productId) {
          throw new NotFoundException(
            `The article ${unit.name} - ${unit.barcode} does not have a product associated with it`,
          );
        }
        const totalOutside: { total: number } =
          await transactionDetailsRepository
            .createQueryBuilder('td')
            .select(
              `COALESCE(
                    SUM(CASE
                        WHEN t.transaction_type = 'EXIT' AND td.afectation = FALSE THEN td.quantity * a.factor
                        ELSE 0
                    END), 0
                ) - 
                COALESCE(
                    SUM(CASE
                        WHEN t.transaction_type = 'ENTRY' AND td.afectation = FALSE THEN td.quantity * a.factor
                        ELSE 0
                    END), 0
                ) AS total`,
            )
            .innerJoin('td.transaction', 't')
            .innerJoin('td.article', 'a')
            .innerJoin('a.product', 'p')
            .where('p.id = :productId', { productId: productId })
            .getRawOne();

        if (
          !totalOutside.total ||
          totalOutside.total < unit.quantity * unit.factor
        ) {
          throw new ConflictException(
            `The product ${unit.name} has insufficient unmatched exits for this entry. Total outside without afectation: ${totalOutside.total}`,
          );
        }
      }
    }
  }

  private async validateExit(unit: Unit, manager: EntityManager) {
    const transactionDetailsRepository =
      manager.getRepository(TransactionDetail);
    if (unit.serial) {
      const transactionsDetails = await transactionDetailsRepository.find({
        where: { serialNumber: unit.serial },
        relations: ['article', 'transaction'],
        order: { createdAt: 'DESC' },
      });
      if (transactionsDetails.length === 0) {
        throw new NotFoundException(
          `The article ${unit.name} with serial number ${unit.serial} is not in the inventory`,
        );
      } else {
        const lastTransactionDetail = transactionsDetails[0];
        if (lastTransactionDetail.transaction.transaction_type === 'EXIT') {
          throw new ConflictException(
            `The article ${unit.name} with serial number ${unit.serial} is already out of inventory. Last transaction: ${lastTransactionDetail.transaction.folio_number}`,
          );
        }
      }
    } else {
      let productId = unit.productId;
      if (!unit.productId) {
        const article = await manager.findOne(Article, {
          where: { barcode: unit.barcode },
          relations: ['product'],
        });
        productId = article.product.id;
      }
      if (!productId) {
        throw new NotFoundException(
          `The article ${unit.name} - ${unit.barcode} does not have a product associated with it`,
        );
      }
      const totalAvailable: { total: number } =
        await transactionDetailsRepository
          .createQueryBuilder('td')
          .select(
            `COALESCE(
                SUM(CASE
                    WHEN t.transaction_type = 'ENTRY' THEN td.quantity * a.factor
                    WHEN t.transaction_type = 'EXIT' THEN -td.quantity * a.factor
                    ELSE 0
                END), 0
              ) AS total`,
          )
          .innerJoin('td.transaction', 't')
          .innerJoin('td.article', 'a')
          .innerJoin('a.product', 'p')
          .where('p.id = :productId', { productId: productId })
          .getRawOne();

      if (
        !totalAvailable.total ||
        totalAvailable.total < unit.quantity * unit.factor
      ) {
        throw new ConflictException(
          `The product ${unit.name} does not have enough inventory for the requested exit. Total available: ${totalAvailable.total}`,
        );
      }
    }
  }

  async getTransaction(id: number) {
    return this.transactionRepository.findOne({ where: { id } });
  }
}
