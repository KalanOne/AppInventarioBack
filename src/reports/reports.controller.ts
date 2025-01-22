import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

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
}
