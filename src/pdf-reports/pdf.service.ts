import imageSize from 'image-size';
import PdfPrinter from 'pdfmake';
import {
  BufferOptions,
  Content,
  ContentColumns,
  ContentStack,
  ContentTable,
  TableCell,
  TFontDictionary,
} from 'pdfmake/interfaces';
import { DriveService } from 'src/drive/drive.service';
import { Readable } from 'stream';
import * as path from 'path';

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import {
  IPdfServiceGeneratePdf,
  IPdfServiceGenerateSignature,
  IPdfServiceGenerateTable,
} from './pdf.type';

@Injectable()
export class PdfService {
  constructor(private readonly driveService: DriveService) {}

  /**
   * Generates a PDF document based on the provided document definition and font descriptors.
   *
   * @param docDefinition - The definition of the document to be generated.
   * @param fontDescriptorsOrigin - Optional custom font descriptors to be merged with the default font descriptors.
   * @returns A promise that resolves to a Buffer containing the generated PDF document.
   */
  async generatePdf({
    docDefinition,
    firstPageHeader,
    defaultFooter,
    defaultDocumentHeader,
    fontDescriptorsOrigin,
    bufferOptionsOrigin,
    extraOptionsDefaultLayout,
  }: IPdfServiceGeneratePdf): Promise<Buffer> {
    if (!docDefinition.defaultStyle) {
      docDefinition.defaultStyle = {
        font: 'Open Sans',
      };
    } else {
      if (!('font' in docDefinition.defaultStyle)) {
        docDefinition.defaultStyle.font = 'Open Sans';
      }
    }

    if (!docDefinition.pageMargins) {
      docDefinition.pageMargins = 20;
    }
    if (!docDefinition.pageSize) {
      docDefinition.pageSize = 'LETTER';
    }
    if (!docDefinition.pageOrientation) {
      docDefinition.pageOrientation = 'portrait';
    }
    if (defaultFooter) {
      docDefinition.footer = (currentPage, pageCount) => {
        return {
          text: `Pág. ${currentPage} de ${pageCount}`,
          alignment: 'right',
          marginRight: 20,
        };
      };
    }

    let fontDescriptors: TFontDictionary = {
      Roboto: {
        normal: path.join(__dirname, 'fonts/Roboto/Roboto-Regular.ttf'),
        bold: path.join(__dirname, 'fonts/Roboto/Roboto-Medium.ttf'),
        italics: path.join(__dirname, 'fonts/Roboto/Roboto-Italic.ttf'),
        bolditalics: path.join(
          __dirname,
          'fonts/Roboto/Roboto-MediumItalic.ttf',
        ),
      },
      'Rubik Wet Paint': {
        normal: path.join(
          __dirname,
          'fonts/Rubik_Wet_Paint/RubikWetPaint-Regular.ttf',
        ),
      },
      'Open Sans': {
        normal: path.join(__dirname, 'fonts/Open_Sans/OpenSans_Regular.ttf'),
        italics: path.join(__dirname, 'fonts/Open_Sans/OpenSans_Italic.ttf'),
        bold: path.join(__dirname, 'fonts/Open_Sans/static/OpenSans-Bold.ttf'),
        bolditalics: path.join(
          __dirname,
          'fonts/Open_Sans/static/OpenSans-BoldItalic.ttf',
        ),
      },
    };

    if (fontDescriptorsOrigin) {
      fontDescriptors = {
        ...fontDescriptorsOrigin,
        ...fontDescriptors,
      };
    }

    if (firstPageHeader || defaultDocumentHeader) {
      const logos = await this.driveService.mainDownloadFiles([
        '1--PvNqx2RwyJLcMfMrClrabso3aXblY0',
        '15D4gNALmZXds8Q6W9JihFM3ZOCt241wv',
      ]);
      const dimensionsCecytemLogo = imageSize(logos[0].buffer as Uint8Array);
      const dimensionsMichoacanLogo = imageSize(logos[1].buffer as Uint8Array);
      docDefinition.images = {
        ...(docDefinition.images || {}),
        logoCecytem: `data:image/jpeg;base64,${logos[0].buffer.toString(
          'base64',
        )}`,
        logoMichoacan: `data:image/jpeg;base64,${logos[1].buffer.toString(
          'base64',
        )}`,
      };

      if (firstPageHeader) {
        docDefinition.content = [
          {
            columns: [
              {
                style: 'logoCecytem',
                image: 'logoCecytem',
                height: 65,
                width:
                  (dimensionsCecytemLogo.width * 65) /
                  dimensionsCecytemLogo.height,
              },
              [
                {
                  text: 'COLEGIO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS DEL ESTADO DE MICHOACAN CECyTEM',
                  fontSize: 14,
                  alignment: 'center',
                  ...(firstPageHeader === true ||
                  (typeof firstPageHeader === 'string' && !!firstPageHeader) ||
                  (Array.isArray(firstPageHeader) &&
                    firstPageHeader.length === 0) ||
                  (typeof firstPageHeader === 'object' &&
                    !Array.isArray(firstPageHeader) &&
                    (!firstPageHeader.value ||
                      firstPageHeader.value.length === 0) &&
                    !firstPageHeader.dir)
                    ? { marginBottom: 35 }
                    : {}),
                },

                ...(firstPageHeader === true ||
                (typeof firstPageHeader === 'string' && !firstPageHeader) ||
                (Array.isArray(firstPageHeader) &&
                  firstPageHeader.length === 0) ||
                (typeof firstPageHeader === 'object' &&
                  !Array.isArray(firstPageHeader) &&
                  (!firstPageHeader.value ||
                    firstPageHeader.value.length === 0) &&
                  !firstPageHeader.dir)
                  ? []
                  : [
                      typeof firstPageHeader === 'string' &&
                      firstPageHeader.length > 0
                        ? ({
                            text: firstPageHeader,
                            fontSize: 11,
                            alignment: 'center',
                            marginTop: 10,
                            marginBottom: 20,
                          } as Content)
                        : ({} as Content),

                      ...(Array.isArray(firstPageHeader) &&
                      firstPageHeader.length > 0
                        ? firstPageHeader.map<Content>((header, index) => {
                            return {
                              text: header,
                              fontSize: 11,
                              alignment: 'center',
                              marginTop: index === 0 ? 10 : 3,
                              ...(index === firstPageHeader.length - 1
                                ? { marginBottom: 20 }
                                : {}),
                            };
                          })
                        : []),

                      ...(typeof firstPageHeader === 'object' &&
                      !Array.isArray(firstPageHeader)
                        ? [
                            firstPageHeader.dir
                              ? ({
                                  text: 'LOMA DE LAS LIEBRES No. 180 FRACC. LOMAS DEL SUR C.P. 58095 MORELIA MICHOACAN, MEXICO TEL. (443) 315-0175 CON 10 LINEAS R.F.C. CEC-910703-4M2',
                                  fontSize: 8,
                                  alignment: 'center',
                                  marginBottom:
                                    firstPageHeader.value &&
                                    firstPageHeader.value.length > 0
                                      ? 0
                                      : 20,
                                } as Content)
                              : ({} as Content),

                            firstPageHeader.value &&
                              firstPageHeader.value.length > 0 && [
                                typeof firstPageHeader.value === 'string'
                                  ? ({
                                      text: firstPageHeader.value,
                                      fontSize: 11,
                                      alignment: 'center',
                                      marginTop: firstPageHeader.dir ? 5 : 10,
                                      marginBottom: 20,
                                    } as Content)
                                  : ({} as Content),
                                ...(Array.isArray(firstPageHeader.value)
                                  ? firstPageHeader.value.map<Content>(
                                      (header, index) => {
                                        return {
                                          text: header,
                                          fontSize: 11,
                                          alignment: 'center',
                                          marginTop:
                                            index === 0
                                              ? firstPageHeader.dir
                                                ? 5
                                                : 10
                                              : 3,
                                          ...(index ===
                                            firstPageHeader.value.length -
                                              1 && {
                                            marginBottom: 20,
                                          }),
                                        };
                                      },
                                    )
                                  : []),
                              ],
                          ]
                        : []),
                    ]),
              ],
              {
                style: 'logoMich',
                image: 'logoMichoacan',
                height: 65,
                width:
                  (dimensionsMichoacanLogo.width * 65) /
                  dimensionsMichoacanLogo.height,
              },
            ],
          },
          ...(Array.isArray(docDefinition.content)
            ? docDefinition.content
            : [docDefinition.content]),
        ];
      }
      if (defaultDocumentHeader) {
        if (Array.isArray(docDefinition.pageMargins)) {
          if (docDefinition.pageMargins.length === 2) {
            docDefinition.pageMargins = [
              docDefinition.pageMargins[0],
              40,
              docDefinition.pageMargins[1],
              docDefinition.pageMargins[1],
            ];
          } else if (docDefinition.pageMargins.length === 4) {
            docDefinition.pageMargins = [
              docDefinition.pageMargins[0],
              40,
              docDefinition.pageMargins[2],
              docDefinition.pageMargins[3],
            ];
          }
        } else if (typeof docDefinition.pageMargins === 'number') {
          docDefinition.pageMargins = [
            docDefinition.pageMargins,
            40,
            docDefinition.pageMargins,
            docDefinition.pageMargins,
          ];
        } else {
          docDefinition.pageMargins = [20, 40, 20, 20];
        }
        docDefinition.header = (_currentPage, _pageCount): any => {
          return {
            columns: [
              {
                style: 'logoCecytem',
                image: 'logoCecytem',
                height: 20,
                width:
                  (dimensionsCecytemLogo.width * 20) /
                  dimensionsCecytemLogo.height,
                opacity: 0.7,
                alignment: 'left',
              },
              {
                stack: [
                  {
                    text: 'COLEGIO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS DEL ESTADO DE MICHOACAN CECyTEM',
                    fontSize: 11,
                    opacity: 0.7,
                    alignment: 'center',
                  },
                  ...(typeof defaultDocumentHeader == 'string'
                    ? [
                        {
                          text: defaultDocumentHeader,
                          fontSize: 10,
                          opacity: 0.7,
                          alignment: 'center',
                        },
                      ]
                    : []),
                ],
                marginLeft: 10,
                marginRight: 10,
                alignment: 'center',
              },
              {
                style: 'logoMich',
                image: 'logoMichoacan',
                height: 20,
                width:
                  (dimensionsMichoacanLogo.width * 20) /
                  dimensionsMichoacanLogo.height,
                alignment: 'right',
              },
            ],
            marginLeft: docDefinition.pageMargins[0],
            marginRight: docDefinition.pageMargins[2],
            marginTop: 10,
            marginBottom: 10,
          };
        };
      }
    }

    const bufferOptions: BufferOptions = {
      tableLayouts: {
        defaultLayout: {
          fillColor: (i, node) => {
            if (node.table.headerRows && i < node.table.headerRows) {
              return extraOptionsDefaultLayout?.headerFillColor ?? '#D4D4D4';
            }
            return i % 2 === 0
              ? (extraOptionsDefaultLayout?.rowFillColor ?? '#EEEEEE')
              : null;
          },
          hLineWidth: (i, node) => {
            if (
              (node.table.headerRows && i <= node.table.headerRows) ||
              i === 0
            ) {
              return 1;
            }
            if (i > node.table.body.length - 1) {
              return node.table.body[node.table.body.length - 1].reduce<number>(
                (acc, cell) => {
                  if ('border' in cell && cell.border[1] && cell.border[3]) {
                    return 1;
                  }
                  return acc;
                },
                0,
              );
            }
            return node.table.body[i].reduce<number>((acc, cell) => {
              if ('border' in cell && cell.border[1] && cell.border[3]) {
                return 1;
              }
              return acc;
            }, 0);
          },
          vLineWidth: (_i, _node) => {
            return 0;
          },
          hLineColor: (i, _node) => {
            return i === 1 ? 'black' : null;
          },
          vLineColor: (_i, _node) => {
            return null;
          },
          paddingLeft: () => 3,
          paddingRight: () => 3,
          paddingTop: (i, node) => {
            if (node.table.headerRows && i < node.table.headerRows) {
              return 3;
            }
            return 6;
          },
          paddingBottom: (i, node) => {
            if (node.table.headerRows && i < node.table.headerRows) {
              return 3;
            }
            return 6;
          },
          ...extraOptionsDefaultLayout,
        },
        ...(bufferOptionsOrigin?.tableLayouts || {}),
      },
      fontLayoutCache: bufferOptionsOrigin?.fontLayoutCache,
      bufferPages: bufferOptionsOrigin?.bufferPages,
      autoPrint: bufferOptionsOrigin?.autoPrint,
      progressCallback: bufferOptionsOrigin?.progressCallback,
    };

    const printer = new PdfPrinter(fontDescriptors);
    const doc = printer.createPdfKitDocument(docDefinition, bufferOptions);

    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Uint8Array[] = [];
      doc.on('data', function (chunk: Uint8Array) {
        chunks.push(chunk);
      });
      doc.on('end', function () {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      doc.on('error', function (err: any) {
        reject(err);
      });
      doc.end();
    });
  }

  /**
   * Generates a PDF document based on the provided document definition and font descriptors,
   * and returns it as a base64 encoded string.
   *
   * @param docDefinition - The definition of the PDF document to be generated.
   * @param fontDescriptorsOrigin - Optional font descriptors to be used in the PDF document.
   * @returns A promise that resolves to a base64 encoded string representing the generated PDF document.
   */
  async generateBase64Pdf(
    iPdfServiceGeneratePdf: IPdfServiceGeneratePdf,
  ): Promise<string> {
    const pdf = await this.generatePdf(iPdfServiceGeneratePdf);
    return pdf.toString('base64');
  }

  /**
   * Generates a PDF file based on the provided document definition and optional font descriptors.
   *
   * @param docDefinition - The definition of the document to be converted to PDF.
   * @param fontDescriptorsOrigin - Optional font descriptors for the PDF generation.
   * @returns  A promise that resolves to an Express Multer file object containing the generated PDF.
   */
  async generatePdfFile(
    iPdfServiceGeneratePdf: IPdfServiceGeneratePdf,
  ): Promise<Express.Multer.File> {
    const pdf = await this.generatePdf(iPdfServiceGeneratePdf);
    const file: Express.Multer.File = {
      buffer: pdf,
      fieldname: 'pdf',
      originalname: 'report.pdf',
      filename: 'report.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: pdf.length,
      destination: '',
      path: '',
      stream: Readable.from(pdf),
    };
    return file;
  }

  /**
   * Generates a table for a PDF report.
   *
   * @template T - The type of the data items.
   * @param data - The data to be displayed in the table.
   * @param headers - The headers for the table.
   * @param getData - A function to extract the row data from a data item.
   * @param filter - An optional filter function to filter the data.
   * @param widths - The widths of the table columns. Default to equal widths.
   * @param heights - The heights of the table rows.
   * @param headerRows - The number of header rows in the table. Defaults to 1.
   * @param dontBreakRows - Whether to prevent rows from breaking across pages.
   * @param keepWithHeaderRows - Whether to keep rows together with header rows. Defaults to true.
   * @param rest - Additional properties to be added to the table.
   * @returns {ContentTable} The generated table.
   */
  generateTable<T>({
    data,
    headers,
    getData,
    filter,
    footer,
    widths,
    heights,
    headerRows,
    dontBreakRows,
    keepWithHeaderRows,
    defaultNoDataLegend = true,
    ...rest
  }: IPdfServiceGenerateTable<T>): ContentTable {
    if (
      (!data || (data && !data.length) || !getData) &&
      (!headers || (headers && !headers.length)) &&
      !footer &&
      defaultNoDataLegend === false
    ) {
      throw new HttpException(
        'No data to display in the table.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let columnsQuantity = headers && headers.length ? headers[0].length : 0;
    if (
      headers &&
      !headers.every((header) => header.length === columnsQuantity)
    ) {
      throw new HttpException(
        'All header rows must have the same number of columns.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const finalData = data && filter ? data.filter(filter) : data;
    const table: ContentTable = {
      layout: 'defaultLayout',
      table: {
        headerRows: headerRows ?? (headers ? headers.length : 0),
        heights,
        dontBreakRows: dontBreakRows ?? true,
        keepWithHeaderRows,
        body: [
          ...(headers
            ? headers.map((header) =>
                header.map<TableCell>((cell) => {
                  if (typeof cell === 'string' || typeof cell === 'number') {
                    return {
                      text: cell.toString(),
                      style: {
                        alignment: 'center',
                        fontSize: 10,
                      },
                    };
                  } else if ('text' in cell) {
                    return {
                      ...cell,
                      style: [
                        {
                          alignment: 'center',
                          fontSize: 10,
                        },
                        ...(typeof cell.style === 'string'
                          ? [cell.style]
                          : Array.isArray(cell.style)
                            ? cell.style
                            : cell.style
                              ? [cell.style]
                              : []),
                      ],
                    };
                  } else {
                    return cell;
                  }
                }),
              )
            : []),

          ...((!finalData || finalData.length === 0) &&
          defaultNoDataLegend !== false
            ? [
                [
                  {
                    text:
                      typeof defaultNoDataLegend == 'undefined'
                        ? 'No hay datos para mostrar.'
                        : typeof defaultNoDataLegend == 'string'
                          ? defaultNoDataLegend
                          : defaultNoDataLegend
                            ? 'No hay datos para mostrar.'
                            : '',
                    colSpan: columnsQuantity,
                    style: {
                      alignment: 'center',
                    },
                    fillColor: '#eaeded',
                  },
                ],
              ]
            : []),

          ...(finalData && finalData.length > 0 && getData
            ? finalData.map<TableCell[]>((row, index, array) => {
                const rowData = getData(row, index, array);
                if (
                  columnsQuantity !== 0 &&
                  rowData.length !== columnsQuantity
                ) {
                  throw new HttpException(
                    `The number of columns in the row data does not match the number of columns in the headers. Expected ${columnsQuantity}, but got ${rowData.length}.`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                } else if (columnsQuantity === 0) {
                  columnsQuantity = rowData.length;
                }
                return rowData.map<TableCell>((cell) => {
                  if (typeof cell === 'string' || typeof cell === 'number') {
                    return {
                      text: cell.toString(),
                      style: {
                        alignment: isNaN(Number(cell)) ? 'left' : 'center',
                        fontSize: 7.5,
                      },
                    };
                  } else if ('text' in cell) {
                    return {
                      ...cell,
                      style: [
                        {
                          alignment:
                            typeof cell.text === 'number'
                              ? 'center'
                              : isNaN(Number(cell.text))
                                ? 'left'
                                : 'center',
                          fontSize: 7.5,
                        },
                        ...(typeof cell.style === 'string'
                          ? [cell.style]
                          : Array.isArray(cell.style)
                            ? cell.style
                            : cell.style
                              ? [cell.style]
                              : []),
                      ],
                    };
                  } else {
                    return cell;
                  }
                });
              })
            : []),

          ...(finalData && footer
            ? footer(finalData).map<TableCell[]>((row) => {
                if (columnsQuantity !== 0 && row.length !== columnsQuantity) {
                  throw new HttpException(
                    `The number of columns in the footer data does not match the number of columns in the headers. Expected ${columnsQuantity}, but got ${row.length}.`,
                    HttpStatus.INTERNAL_SERVER_ERROR,
                  );
                }
                return row.map<TableCell>((cell) => {
                  if (typeof cell === 'string' || typeof cell === 'number') {
                    return {
                      text: cell.toString(),
                      alignment: typeof cell === 'number' ? 'center' : 'left',
                      fillColor: '#D4D4D4',
                      border: [false, true, false, true],
                    };
                  } else if ('text' in cell) {
                    return {
                      border: [false, true, false, true],
                      ...cell,
                      style: [
                        {
                          alignment: isNaN(Number(cell.text))
                            ? 'left'
                            : 'center',
                          fillColor: '#D4D4D4',
                        },
                        ...(typeof cell.style === 'string'
                          ? [cell.style]
                          : Array.isArray(cell.style)
                            ? cell.style
                            : cell.style
                              ? [cell.style]
                              : []),
                      ],
                    };
                  } else {
                    return cell;
                  }
                });
              })
            : []),
        ],
        widths: widths
          ? widths
          : columnsQuantity
            ? Array(columnsQuantity).fill(`${100 / columnsQuantity}%`)
            : ['100%'],
      },
      marginBottom: 5,
      marginTop: 5,
      ...rest,
    };
    return table;
  }

  /**
   * Generates an array of ContentColumns based on the provided signatures.
   *
   * @param {Array<string | string[]>} signatures - An array of signatures, where each signature can be a string or an array of strings.
   * @param {number} columns - The number of columns to be generated. Default is 3.
   *
   * @returns {ContentColumns[]} An array of ContentColumns objects, each containing formatted signature data.
   */
  generateSignature({
    signatures,
    columns = 3,
  }: IPdfServiceGenerateSignature): ContentStack {
    // const maxStringLength: number = signatures.reduce((acc, curr) => {
    //   if (typeof curr === 'string') {
    //     return Math.max(curr.length, acc);
    //   } else if (Array.isArray(curr)) {
    //     return Math.max(acc, ...curr.map((subItem) => subItem.length));
    //   } else {
    //     return acc;
    //   }
    // }, 0);

    const mArrays: (string | string[])[][] = (() => {
      const mainArray: (string | string[])[][] = [];
      let lastArray: (string | string[])[] = [];
      signatures.forEach((value) => {
        lastArray.push(value);
        if (lastArray.length == columns) {
          mainArray.push(lastArray);
          lastArray = [];
        }
      });
      if (lastArray.length) {
        mainArray.push(lastArray);
      }
      return mainArray;
    })();

    return {
      stack: mArrays.map<ContentColumns>((item) => {
        return {
          columns: [
            ...item.map((subItem) => {
              if (typeof subItem == 'string') {
                // const spaces = parseInt(
                //   `${(maxStringLength - subItem.length) / 2 > Math.sqrt(maxStringLength) ? Math.sqrt(maxStringLength) / 3 + (maxStringLength - subItem.length) / 2 : (maxStringLength - subItem.length) / 2}`,
                // );
                const obj: ContentStack = {
                  stack: [
                    {
                      text: '_'.repeat(25),
                      marginTop: 70,
                      alignment: 'center',
                    },
                    {
                      // text: `${' '.repeat(spaces)}${subItem}${' '.repeat(spaces)}`,
                      text: subItem,
                      // decoration: 'overline',
                      preserveLeadingSpaces: true,
                      preserveTrailingSpaces: true,
                      // marginTop: 70,
                      style: {
                        alignment: 'center',
                        bold: true,
                      },
                    },
                  ],
                  unbreakable: true,
                };
                return obj;
              } else {
                const obj: ContentStack = {
                  stack: [
                    {
                      text: '_'.repeat(25),
                      marginTop: 70,
                      alignment: 'center',
                    },
                    subItem.map((subSubItem, index) => {
                      // const spaces = parseInt(
                      //   `${(maxStringLength - subSubItem.length) / 2 > Math.sqrt(maxStringLength) ? Math.sqrt(maxStringLength) / 3 + (maxStringLength - subSubItem.length) / 2 : (maxStringLength - subSubItem.length) / 2}`,
                      // );
                      return {
                        // text:
                        //   index == 0
                        //     ? `${' '.repeat(spaces)}${subSubItem}${' '.repeat(spaces)}`
                        //     : subSubItem,
                        text: subSubItem,
                        style: {
                          alignment: 'center',
                          ...(index == 0 ? { bold: true } : { italics: true }),
                        },
                        ...(index == 0
                          ? {
                              // marginTop: 70,
                              // decoration: 'overline',
                              preserveLeadingSpaces: true,
                              preserveTrailingSpaces: true,
                            }
                          : {}),
                      };
                    }),
                  ],
                  unbreakable: true,
                };
                return obj;
              }
            }),
          ],
          columnGap: 2,
        };
      }),
      unbreakable: true,
    };
  }
}
