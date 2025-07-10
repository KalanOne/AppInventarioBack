import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { query, Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';
import { FilterReportInventarioDto } from './dto/filter-report-inventario.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transaction/:id')
  async getTransactionReport(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.getTransactionReport(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reprogramacion.pdf"',
    });
    res.end(pdf);
  }

  @Get('inventory')
  async getInventoryReport(
    @Res() res: Response,
    @Query() query: FilterReportInventarioDto,
  ) {
    const excel = await this.reportsService.exportInventoryExcel(query);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="inventario.xlsx"',
    });
    res.end(excel);
  }
}
