import {
  BufferOptions,
  ContentBase,
  ContentText,
  CustomTableLayout,
  DynamicRowSize,
  Size,
  TableCellProperties,
  TDocumentDefinitions,
  TFontDictionary,
} from 'pdfmake/interfaces';

export type {
  IPdfServiceGeneratePdf,
  IPdfServiceGenerateTable,
  IPdfServiceGenerateSignature,
};

/**
 * Interface representing the options for generating a PDF.
 */
interface IPdfServiceGeneratePdf {
  /**
   * The document definition object that describes the structure and content of the PDF.
   */
  docDefinition: TDocumentDefinitions;

  /**
   * Optional default header for the first page of the PDF. Can be a boolean, string, array of strings, or an object with value and dir properties.
   */
  firstPageHeader?:
    | boolean
    | string
    | string[]
    | { value?: string | string[]; dir?: boolean };

  /**
   * Optional default footer for the PDF. Can be a boolean.
   */
  defaultFooter?: boolean;

  /**
   * Optional default header for the document. Can be a boolean.
   */
  defaultDocumentHeader?: boolean | string;

  /**
   * Optional font descriptors for the PDF.
   */
  fontDescriptorsOrigin?: TFontDictionary;

  /**
   * Optional buffer options for the PDF.
   */
  bufferOptionsOrigin?: BufferOptions;

  /**
   * Optional extra options for the default layout of the PDF.
   */
  extraOptionsDefaultLayout?: Partial<CustomTableLayout> & {
    headerFillColor?: string;
    rowFillColor?: string;
  };
}

/**
 * Interface representing the configuration for generating a table in a PDF.
 *
 * @template T - The type of data contained in the table.
 *
 * @property data - The {@link data} to be displayed in the table.
 * @property headers - The {@link headers} for the table columns.
 * @property widths - Column {@link widths} of the table.
 * @property heights - Row {@link heights} of the table.
 * @property headerRows - Number of {@link headerRows rows} from the top that make up the table's header.
 * @property dontBreakRows - Controls whether the contents of a table {@link dontBreakRows row} should be kept together on the same page.
 * @property keepWithHeaderRows - Number of rows after the given {@link headerRows} that should be kept together with the header rows, without a page break in between.
 */
interface IPdfServiceGenerateTable<T>
  extends Omit<Partial<ContentBase>, 'table'> {
  /**
   * The data to be displayed in the table.
   */
  data?: T[] | undefined;

  /**
   * The headers for the table columns.
   */
  headers?: ({} | ((string | number | ContentText) & TableCellProperties))[][];

  /**
   * Function to generate the content of each cell in the table.
   * @warning The index could be different from the actual index of the data, this is because the function is called after filtering the data.
   * A cell of a Table.
   * - Can be any valid content. Content objects provide additional properties to control
   *   the cell's appearance.
   * - Use empty objects (`{}`) as placeholders for cells that are covered by other cells
   *   spanning multiple rows or columns.
   */
  getData?: (
    value: T,
    index: number,
    array: T[],
  ) => ({} | ((string | number | ContentText) & TableCellProperties))[];

  /**
   * Filter function to apply to the data before generating the table.
   */
  filter?: (value: T, index: number, array: T[]) => boolean | undefined;

  /**
   * Function to generate the footer of the table.
   * The footer is displayed at the bottom of the table.
   * The data passed to the function is the filtered data.
   */
  footer?: (
    data: T[],
  ) =>
    | ({} | ((string | number | ContentText) & TableCellProperties))[][]
    | undefined;

  /**
   * Generates a custom or default legend when there is no data to display after filtering.
   * - `true` generates a default legend.
   * - `false` does not generate a legend.
   * - A string generates a custom legend.
   *
   * Defaults to `true`.
   */
  defaultNoDataLegend?: boolean | string | undefined;

  /**
   * Column widths of the table.
   * - `*` distributes the width equally, filling the whole available space.
   * - `auto` sets the widths based on the content, filling only the necessary space.
   * - Use an array to control the width of each column individually.
   *   The array must contain widths for all columns.
   *
   * A column width smaller than a cell's content will break the text into multiple lines.
   *
   * Defaults to equal distribution.
   */
  widths?: '*' | 'auto' | Size[] | undefined;
  /**
   * Row heights of the table.
   * - A number sets an absolute height in `pt` for every row.
   * - `auto` sets the heights based on the content.
   * - Use an array or a callback function to control the height of each row individually.
   *
   * The given values are ignored for rows whose content is higher.
   *
   * Defaults to `auto`.
   */
  heights?:
    | number
    | 'auto'
    | Array<number | 'auto'>
    | DynamicRowSize
    | undefined;
  /**
   * Number of rows from the top that make up the table's header.
   *
   * If the table spans across multiple pages, the header is repeated on every page.
   *
   * Defaults to `0`.
   */
  headerRows?: number | undefined;

  /**
   * Controls whether the contents of a table row should be kept together on the same page.
   *
   * Defaults to `false`.
   */
  dontBreakRows?: boolean | undefined;

  /**
   * Number of rows after the given {@link headerRows} that should be kept together with
   * the header rows, without a page break in between.
   *
   * Defaults to `0`.
   */
  keepWithHeaderRows?: number | undefined;
}

/**
 * Interface representing the structure for generating PDF signatures.
 */
interface IPdfServiceGenerateSignature {
  signatures: (string | string[])[];
  columns?: number;
}
