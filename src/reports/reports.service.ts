import { format } from '@formkit/tempo';
import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { Transaction } from 'src/entities/entities/transaction.entity';
import { PdfService } from 'src/pdf-reports/pdf.service';
import { DataSource } from 'typeorm';
import { FilterReportInventarioDto } from './dto/filter-report-inventario.dto';

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

  async exportInventoryExcel(
    filterReportInventarioDto: FilterReportInventarioDto,
  ) {
    const query = this.dataSource.createQueryRunner();
    const { includeNonAfectation } = filterReportInventarioDto;

    try {
      await query.connect();

      const rawInventory = await query.manager.query(
        `
        -- Artículos SIN número de serie (con transacciones)
        SELECT
          a.id AS article_id,
          a.barcode,
          a.multiple,
          a.factor,
          w.name AS warehouse,
          p.name AS product,
          p.description AS product_description,
          NULL AS serial_number,
          SUM(
            CASE 
              WHEN td.afectation = TRUE THEN 
                CASE 
                  WHEN t.transaction_type = 'ENTRY' THEN td.quantity * a.factor
                  WHEN t.transaction_type = 'EXIT' THEN -td.quantity * a.factor
                  ELSE 0
                END
              WHEN td.afectation = FALSE AND $1 = TRUE THEN 
                CASE 
                  WHEN t.transaction_type = 'ENTRY' THEN td.quantity * a.factor
                  WHEN t.transaction_type = 'EXIT' THEN -td.quantity * a.factor
                  ELSE 0
                END
              ELSE 0
            END
          ) AS total,
          '' AS serials
        FROM transaction_detail td
        INNER JOIN transaction t ON t.id = td."transactionId"
        INNER JOIN article a ON a.id = td."articleId"
        INNER JOIN product p ON p.id = a."productId"
        INNER JOIN warehouse w ON w.id = a."warehouseId"
        WHERE td."serialNumber" IS NULL
        GROUP BY a.id, a.barcode, a.multiple, a.factor, w.name, p.name, p.description
  
        UNION
  
        -- Artículos CON número de serie (último movimiento indica si está dentro)
        SELECT
          a.id AS article_id,
          a.barcode,
          a.multiple,
          a.factor,
          w.name AS warehouse,
          p.name AS product,
          p.description AS product_description,
          serial_data."serialNumber",
          1 AS total,
          serial_data."serialNumber" AS serials
        FROM (
          SELECT DISTINCT ON (td."serialNumber")
            td."serialNumber",
            td.afectation,
            t.transaction_type,
            td."articleId"
          FROM transaction_detail td
          INNER JOIN transaction t ON t.id = td."transactionId"
          WHERE td."serialNumber" IS NOT NULL
          ORDER BY td."serialNumber", td."createdAt" DESC
        ) AS serial_data
        INNER JOIN article a ON a.id = serial_data."articleId"
        INNER JOIN product p ON p.id = a."productId"
        INNER JOIN warehouse w ON w.id = a."warehouseId"
        WHERE 
          (
            serial_data.transaction_type = 'ENTRY'
            OR (
              serial_data.transaction_type = 'EXIT'
              AND (
                (serial_data.afectation = FALSE AND $1 = TRUE)
              )
            )
          )
  
        UNION
  
        -- Artículos sin ninguna transacción registrada
        SELECT
          a.id AS article_id,
          a.barcode,
          a.multiple,
          a.factor,
          w.name AS warehouse,
          p.name AS product,
          p.description AS product_description,
          NULL AS serial_number,
          0 AS total,
          '' AS serials
        FROM article a
        LEFT JOIN transaction_detail td ON td."articleId" = a.id
        INNER JOIN product p ON p.id = a."productId"
        INNER JOIN warehouse w ON w.id = a."warehouseId"
        WHERE td.id IS NULL
        `,
        [includeNonAfectation],
      );

      // Agrupar por artículo
      const inventoryMap = new Map<
        number,
        {
          articleId: number;
          barcode: string;
          multiple: string;
          factor: number;
          warehouse: string;
          product: string;
          product_description: string;
          total: number;
          serials: Set<string>;
        }
      >();

      for (const row of rawInventory) {
        const key = row.article_id;
        if (!inventoryMap.has(key)) {
          inventoryMap.set(key, {
            articleId: key,
            barcode: row.barcode,
            multiple: row.multiple,
            factor: row.factor,
            warehouse: row.warehouse,
            product: row.product,
            product_description: row.product_description,
            total: 0,
            serials: new Set<string>(),
          });
        }

        const entry = inventoryMap.get(key);
        entry.total += Number(row.total);
        if (row.serial_number) {
          entry.serials.add(row.serial_number);
        }
      }

      // Crear archivo Excel
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet('Inventario');

      sheet.columns = [
        { header: 'Producto', key: 'product', width: 30 },
        { header: 'Descripción', key: 'product_description', width: 40 },
        { header: 'Código de barras', key: 'barcode', width: 25 },
        { header: 'Múltiplo', key: 'multiple', width: 15 },
        { header: 'Factor', key: 'factor', width: 10 },
        { header: 'Almacén', key: 'warehouse', width: 20 },
        { header: 'Cantidad total', key: 'total', width: 20 },
        { header: 'Números de serie', key: 'serials', width: 50 },
      ];

      for (const item of inventoryMap.values()) {
        sheet.addRow({
          product: item.product,
          product_description: item.product_description,
          barcode: item.barcode,
          multiple: item.multiple,
          factor: item.factor,
          warehouse: item.warehouse,
          total: item.total,
          serials: Array.from(item.serials).join(', '),
        });
      }

      return workbook.xlsx.writeBuffer();
    } finally {
      await query.release();
    }
  }
}
