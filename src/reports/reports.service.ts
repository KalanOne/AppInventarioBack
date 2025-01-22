import { format } from '@formkit/tempo';
import { Injectable } from '@nestjs/common';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { PdfService } from 'src/pdf-reports/pdf.service';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly dataSource: DataSource,
  ) {}

  async getTransactionReport(id: number): Promise<Buffer> {
    return this.dataSource.transaction(async (manager) => {
      const transactionRepository = manager.getRepository(Transaction);
      const transaction = await transactionRepository.findOneOrFail({
        where: { id },
      });

      const content: Content = [];

      content.push({
        stack: [
          {
            text: `FOLIO: ${transaction.folio_number}`,
          },
          {
            text: `Fecha: ${format(transaction.transaction_date, 'full')}`,
          },
          {
            text: `${transaction.transaction_type == 'ENTRY' ? 'Persona que recibe' : 'Persona que entrega'}: ${transaction.user.first_name} ${transaction.user.last_name}`,
          },
          {
            text: `${transaction.transaction_type == 'EXIT' ? 'Persona que recibe' : 'Persona que entrega'}: ${transaction.person_name}`,
          },
        ],
        style: {
          fontSize: 12,
        },
        marginBottom: 10,
      });

      content.push(
        this.pdfService.generateTable({
          headers: [
            [
              'Nombre',
              'Multiplo',
              'Factor',
              'Codigo de barras',
              'Cantidad',
              'No. serial',
            ],
          ],
          widths: ['20%', '10%', '10%', '25%', '10%', '25%'],
          data: transaction.transactionDetails,
          getData: (detail) => {
            return [
              detail.article.product.name,
              { text: detail.article.multiple, style: { alignment: 'center' } },
              detail.article.factor,
              { text: detail.article.barcode, style: { alignment: 'center' } },
              detail.quantity,
              {
                text: detail.serialNumber ?? 'N/A',
                style: { alignment: 'center' },
              },
            ];
          },
          footer: (data) => {
            return [
              [
                {
                  text: 'Total de articulos',
                  colSpan: 4,
                  style: {
                    alignment: 'right',
                  },
                },
                {},
                {},
                {},
                data.reduce((acc, detail) => acc + detail.quantity, 0),
                '',
              ],
            ];
          },
        }),
      );

      const docDefinitionDef: TDocumentDefinitions = {
        content: [
          ...content,
          this.pdfService.generateSignature({
            signatures: [
              [
                'RECIBE',
                `${transaction.transaction_type == 'ENTRY' ? `${transaction.user.first_name} ${transaction.user.last_name}` : transaction.person_name}`,
              ],
              [
                'ENTREGA',
                `${transaction.transaction_type == 'EXIT' ? `${transaction.user.first_name} ${transaction.user.last_name}` : transaction.person_name}`,
              ],
            ],
          }),
        ],
      };
      return this.pdfService.generatePdf({
        docDefinition: docDefinitionDef,
        firstPageHeader: ['ACUSE DE TRANSACCION'],
        defaultFooter: true,
      });
    });
  }
}
