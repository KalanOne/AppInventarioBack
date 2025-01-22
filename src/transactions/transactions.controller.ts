import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create')
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionsService.createTransaction(
      createTransactionDto,
    );
  }

  @Get(':id')
  async getTransaction(@Param('id') id: number) {
    return await this.transactionsService.getTransaction(id);
  }

  @Get('')
  async getTransactions(@Query() filterTransactionDto: FilterTransactionDto) {
    return await this.transactionsService.getTransactions(filterTransactionDto);
  }
}
