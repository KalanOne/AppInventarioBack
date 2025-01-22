import {
  IsDate,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ArrayTransform,
  DateTransform,
  NumberTransform,
} from 'src/utils/decorators/transforms';

export class FilterTransactionDto {
  @IsOptional()
  @IsString()
  transaction_type?: 'ENTRY' | 'EXIT';

  @IsOptional()
  @DateTransform()
  @IsDate()
  transaction_date?: Date;

  @IsOptional()
  @ArrayTransform({ each: true, type: 'number' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { each: true },
  )
  user_id?: number[];

  @IsOptional()
  @IsString()
  folio_number?: string;

  @IsOptional()
  @IsString()
  person_name?: string;

  @IsOptional()
  @ArrayTransform({ each: true, type: 'number' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { each: true },
  )
  product_id?: number[];

  @IsOptional()
  @ArrayTransform({ each: true, type: 'number' })
  @IsNumber(
    { allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 },
    { each: true },
  )
  article_id?: number[];

  @IsOptional()
  @IsNumber()
  @NumberTransform()
  skip?: number;

  @IsOptional()
  @IsNumber()
  @NumberTransform()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
